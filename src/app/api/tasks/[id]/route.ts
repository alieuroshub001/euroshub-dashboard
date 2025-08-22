import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Task, Project, User } from '@/models';
import { IApiResponse, ITask, ITaskWithDetails, ITaskComment, ITaskTimeLog } from '@/types';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/tasks/[id] - Get specific task details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;

    // Get task with all details
    const tasks = await Task.aggregate([
      { $match: { _id: id } },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedToDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByDetails'
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectDetails'
        }
      },
      {
        $addFields: {
          assignedToDetails: {
            $let: {
              vars: { user: { $arrayElemAt: ['$assignedToDetails', 0] } },
              in: {
                $cond: {
                  if: { $ne: ['$$user', null] },
                  then: {
                    id: '$$user._id',
                    name: '$$user.name',
                    email: '$$user.email',
                    profileImage: '$$user.profileImage'
                  },
                  else: null
                }
              }
            }
          },
          createdByDetails: {
            $let: {
              vars: { user: { $arrayElemAt: ['$createdByDetails', 0] } },
              in: {
                id: '$$user._id',
                name: '$$user.name',
                email: '$$user.email'
              }
            }
          },
          projectDetails: {
            $let: {
              vars: { project: { $arrayElemAt: ['$projectDetails', 0] } },
              in: {
                $cond: {
                  if: { $ne: ['$$project', null] },
                  then: {
                    id: '$$project._id',
                    name: '$$project.name',
                    status: '$$project.status'
                  },
                  else: null
                }
              }
            }
          },
          isOverdue: {
            $and: [
              { $ne: ['$status', 'completed'] },
              { $ne: ['$dueDate', null] },
              { $lt: ['$dueDate', new Date()] }
            ]
          },
          daysRemaining: {
            $cond: {
              if: { $ne: ['$dueDate', null] },
              then: {
                $divide: [
                  { $subtract: ['$dueDate', new Date()] },
                  86400000
                ]
              },
              else: null
            }
          },
          completionPercentage: '$progress'
        }
      }
    ]);

    if (!tasks || tasks.length === 0) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    const task = tasks[0];

    // Check access permissions
    const project = await Project.findById(task.projectId);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Associated project not found'
      }, { status: 404 });
    }

    // Verify user has access to this task
    const hasAccess = ['superadmin', 'admin'].includes(authResult.user.role) ||
      task.assignedTo?.toString() === authResult.user.userId ||
      task.createdBy.toString() === authResult.user.userId ||
      project.createdBy.toString() === authResult.user.userId ||
      project.teamMembers.some(member => member.userId.toString() === authResult.user.userId) ||
      (authResult.user.role === 'client' && project.clientId?.toString() === authResult.user.userId);

    if (!hasAccess) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Access denied to this task'
      }, { status: 403 });
    }

    return NextResponse.json<IApiResponse<ITaskWithDetails>>({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    });

  } catch (error) {
    console.error('Task GET [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update specific task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();

    // Find task and check permissions
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    // Get associated project for permission checking
    const project = await Project.findById(task.projectId);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Associated project not found'
      }, { status: 404 });
    }

    // Check if user has permission to update
    const isAssigned = task.assignedTo?.toString() === authResult.user.userId;
    const isCreator = task.createdBy.toString() === authResult.user.userId;
    const isProjectManager = project.teamMembers.some(
      member => member.userId.toString() === authResult.user.userId && 
      ['manager', 'lead'].includes(member.role)
    );
    const isAdmin = ['superadmin', 'admin'].includes(authResult.user.role);

    if (!isAssigned && !isCreator && !isProjectManager && !isAdmin) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to update task'
      }, { status: 403 });
    }

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      estimatedHours,
      progress,
      dependencies,
      tags,
      attachments,
      isArchived,
      action // Special actions like 'add_comment', 'add_time_log'
    } = data;

    // Handle special actions
    if (action === 'add_comment') {
      const { content } = data;
      if (!content) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Comment content is required'
        }, { status: 400 });
      }

      const comment: ITaskComment = {
        id: uuidv4(),
        content,
        userId: authResult.user.userId,
        createdAt: new Date(),
        isEdited: false
      };

      task.comments.push(comment);
      await task.save();

      return NextResponse.json<IApiResponse>({
        success: true,
        message: 'Comment added successfully',
        data: { comment }
      });
    }

    if (action === 'add_time_log') {
      const { hours, description: timeDescription, date } = data;
      if (!hours || hours <= 0) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Valid hours amount is required'
        }, { status: 400 });
      }

      const timeLog: ITaskTimeLog = {
        id: uuidv4(),
        userId: authResult.user.userId,
        hours,
        description: timeDescription,
        date: date ? new Date(date) : new Date(),
        createdAt: new Date()
      };

      task.timeLogs.push(timeLog);
      task.actualHours = (task.actualHours || 0) + hours;
      await task.save();

      return NextResponse.json<IApiResponse>({
        success: true,
        message: 'Time log added successfully',
        data: { timeLog }
      });
    }

    // Regular task updates
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
        task.progress = 100;
      }
    }
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (progress !== undefined) task.progress = Math.max(0, Math.min(100, progress));
    if (dependencies) task.dependencies = dependencies;
    if (tags) task.tags = tags;
    if (attachments) task.attachments = attachments;

    // Admin/Manager only fields
    if (isAdmin || isProjectManager || isCreator) {
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (isArchived !== undefined) task.isArchived = isArchived;
    }

    await task.save();

    // Return updated task with populated data
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email profileImage')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name status')
      .lean();

    return NextResponse.json<IApiResponse<ITask>>({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });

  } catch (error) {
    console.error('Task PUT [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;

    // Find task and check permissions
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    // Get associated project for permission checking
    const project = await Project.findById(task.projectId);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Associated project not found'
      }, { status: 404 });
    }

    // Only creators, project managers, or admins can delete tasks
    const isCreator = task.createdBy.toString() === authResult.user.userId;
    const isProjectManager = project.teamMembers.some(
      member => member.userId.toString() === authResult.user.userId && 
      ['manager', 'lead'].includes(member.role)
    );
    const isAdmin = ['superadmin', 'admin'].includes(authResult.user.role);

    if (!isCreator && !isProjectManager && !isAdmin) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to delete task'
      }, { status: 403 });
    }

    // Soft delete by archiving
    task.isArchived = true;
    await task.save();

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Task archived successfully'
    });

  } catch (error) {
    console.error('Task DELETE [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}