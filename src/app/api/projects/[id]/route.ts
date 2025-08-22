import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project, Task, User } from '@/models';
import { IApiResponse, IProject, IProjectWithStats } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/projects/[id] - Get specific project details
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

    // Build access filter based on user role
    let accessFilter: any = { _id: id };

    if (authResult.user.role === 'client') {
      accessFilter.clientId = authResult.user.userId;
    } else if (!['superadmin', 'admin'].includes(authResult.user.role)) {
      // For employees, check if they're team members or creators
      accessFilter.$or = [
        { 'teamMembers.userId': authResult.user.userId },
        { createdBy: authResult.user.userId }
      ];
    }

    // Get project with stats
    const projects = await Project.aggregate([
      { $match: accessFilter },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'projectId',
          as: 'tasks'
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
          from: 'users',
          localField: 'clientId',
          foreignField: '_id',
          as: 'clientDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teamMembers.userId',
          foreignField: '_id',
          as: 'teamMemberDetails'
        }
      },
      {
        $addFields: {
          taskCount: { $size: '$tasks' },
          completedTaskCount: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: { $eq: ['$$task.status', 'completed'] }
              }
            }
          },
          overdueTaskCount: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: {
                  $and: [
                    { $ne: ['$$task.status', 'completed'] },
                    { $lt: ['$$task.dueDate', new Date()] }
                  ]
                }
              }
            }
          },
          activeTaskCount: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: { $in: ['$$task.status', ['todo', 'in_progress', 'in_review']] }
              }
            }
          },
          teamMemberCount: { $size: '$teamMembers' },
          completionPercentage: {
            $cond: {
              if: { $eq: [{ $size: '$tasks' }, 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'completed'] }
                          }
                        }
                      },
                      { $size: '$tasks' }
                    ]
                  },
                  100
                ]
              }
            }
          },
          isOverdue: {
            $and: [
              { $ne: ['$status', 'completed'] },
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
          createdByDetails: { $arrayElemAt: ['$createdByDetails', 0] },
          clientDetails: { $arrayElemAt: ['$clientDetails', 0] },
          teamMembers: {
            $map: {
              input: '$teamMembers',
              as: 'member',
              in: {
                $let: {
                  vars: {
                    userDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$teamMemberDetails',
                            as: 'user',
                            cond: { $eq: ['$$user._id', '$$member.userId'] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    userId: '$$member.userId',
                    role: '$$member.role',
                    joinedAt: '$$member.joinedAt',
                    permissions: '$$member.permissions',
                    name: '$$userDetail.name',
                    email: '$$userDetail.email',
                    profileImage: '$$userDetail.profileImage'
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          tasks: 0,
          teamMemberDetails: 0
        }
      }
    ]);

    if (!projects || projects.length === 0) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found or access denied'
      }, { status: 404 });
    }

    return NextResponse.json<IApiResponse<IProjectWithStats>>({
      success: true,
      message: 'Project retrieved successfully',
      data: projects[0]
    });

  } catch (error) {
    console.error('Project GET [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update specific project
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

    // Find project and check permissions
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check if user has permission to update
    const isCreator = project.createdBy.toString() === authResult.user.userId;
    const isTeamManager = project.teamMembers.some(
      member => member.userId.toString() === authResult.user.userId && 
      ['manager', 'lead'].includes(member.role)
    );
    const isAdmin = ['superadmin', 'admin'].includes(authResult.user.role);

    if (!isCreator && !isTeamManager && !isAdmin) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to update project'
      }, { status: 403 });
    }

    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
      estimatedHours,
      budget,
      clientId,
      teamMembers,
      tags,
      attachments,
      isArchived
    } = data;

    // Update project fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate !== undefined) project.startDate = startDate ? new Date(startDate) : undefined;
    if (dueDate !== undefined) project.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (estimatedHours !== undefined) project.estimatedHours = estimatedHours;
    if (budget !== undefined) project.budget = budget;
    if (tags) project.tags = tags;
    if (attachments) project.attachments = attachments;

    // Admin-only fields
    if (isAdmin || isCreator) {
      if (clientId !== undefined) project.clientId = clientId;
      if (isArchived !== undefined) project.isArchived = isArchived;
      
      // Validate and update team members
      if (teamMembers) {
        const memberIds = teamMembers.map((m: any) => m.userId);
        const validUsers = await User.find({ 
          _id: { $in: memberIds },
          isActive: true
        });

        if (validUsers.length !== memberIds.length) {
          return NextResponse.json<IApiResponse>({
            success: false,
            message: 'Some team member IDs are invalid'
          }, { status: 400 });
        }

        project.teamMembers = teamMembers;
      }
    }

    await project.save();

    // Return updated project with populated data
    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email profileImage')
      .lean();

    return NextResponse.json<IApiResponse<IProject>>({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });

  } catch (error) {
    console.error('Project PUT [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete project (admin only)
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

    // Only admins and project creators can delete
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    const isCreator = project.createdBy.toString() === authResult.user.userId;
    const isAdmin = ['superadmin', 'admin'].includes(authResult.user.role);

    if (!isCreator && !isAdmin) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Only project creator or admin can delete project'
      }, { status: 403 });
    }

    // Soft delete by archiving instead of hard delete to maintain data integrity
    project.isArchived = true;
    await project.save();

    // Also archive all related tasks
    await Task.updateMany(
      { projectId: id },
      { isArchived: true }
    );

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Project archived successfully'
    });

  } catch (error) {
    console.error('Project DELETE [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}