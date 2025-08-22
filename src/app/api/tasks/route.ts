import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Task, Project, User } from '@/models';
import { IApiResponse, ITask, ITaskWithDetails, ITaskFilter } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/tasks - Get tasks with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const createdBy = searchParams.get('createdBy');
    const isArchived = searchParams.get('isArchived') === 'true';

    // Build filter based on user role and permissions
    const filter: any = { isArchived };

    // Role-based filtering
    if (authResult.user.role === 'client') {
      // Clients can only see tasks from their projects
      const clientProjects = await Project.find({ clientId: authResult.user.userId }).select('_id');
      filter.projectId = { $in: clientProjects.map(p => p._id) };
    } else if (!['superadmin', 'admin'].includes(authResult.user.role)) {
      // For employees, show tasks they're assigned to, created, or from projects they're members of
      const userProjects = await Project.find({
        $or: [
          { 'teamMembers.userId': authResult.user.userId },
          { createdBy: authResult.user.userId }
        ]
      }).select('_id');

      filter.$or = [
        { assignedTo: authResult.user.userId },
        { createdBy: authResult.user.userId },
        { projectId: { $in: userProjects.map(p => p._id) } }
      ];
    }

    // Additional filters
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdBy) filter.createdBy = createdBy;

    const skip = (page - 1) * limit;

    // Get tasks with details
    const tasks = await Task.aggregate([
      { $match: filter },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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

    const total = await Task.countDocuments(filter);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const data = await req.json();
    const {
      title,
      description,
      projectId,
      status = 'todo',
      priority,
      assignedTo,
      dueDate,
      estimatedHours,
      dependencies = [],
      tags = [],
      attachments = []
    } = data;

    if (!title || !projectId || !priority) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Title, project ID, and priority are required'
      }, { status: 400 });
    }

    // Validate project access
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check if user has access to the project
    const hasProjectAccess = ['superadmin', 'admin'].includes(authResult.user.role) ||
      project.createdBy.toString() === authResult.user.userId ||
      project.teamMembers.some(member => member.userId.toString() === authResult.user.userId);

    if (!hasProjectAccess) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'No access to this project'
      }, { status: 403 });
    }

    // Validate assigned user if provided
    if (assignedTo) {
      const assignedUser = await User.findOne({ 
        _id: assignedTo,
        isActive: true
      });

      if (!assignedUser) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Invalid assigned user'
        }, { status: 400 });
      }
    }

    // Validate dependencies if provided
    if (dependencies.length > 0) {
      const validDependencies = await Task.find({ 
        _id: { $in: dependencies },
        projectId
      });

      if (validDependencies.length !== dependencies.length) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Some dependency task IDs are invalid'
        }, { status: 400 });
      }
    }

    // Create task
    const task = new Task({
      title,
      description,
      projectId,
      status,
      priority,
      assignedTo,
      createdBy: authResult.user.userId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      dependencies,
      tags,
      attachments,
      progress: 0,
      actualHours: 0,
      isArchived: false,
      comments: [],
      timeLogs: []
    });

    await task.save();

    // Populate related data
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email profileImage')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name status')
      .lean();

    return NextResponse.json<IApiResponse<ITask>>({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    }, { status: 201 });

  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}