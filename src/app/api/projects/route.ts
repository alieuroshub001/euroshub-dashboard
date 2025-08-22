import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project, Task, User } from '@/models';
import { IApiResponse, IProject, IProjectWithStats, IProjectFilter } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/projects - Get projects with filters
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const clientId = searchParams.get('clientId');
    const isArchived = searchParams.get('isArchived') === 'true';

    // Build filter based on user role
    const filter: any = { isArchived };

    // Role-based filtering
    if (authResult.user.role === 'client') {
      filter.clientId = authResult.user.userId;
    } else if (!['superadmin', 'admin'].includes(authResult.user.role)) {
      // For employees, show projects they're members of or created
      filter.$or = [
        { 'teamMembers.userId': authResult.user.userId },
        { createdBy: authResult.user.userId }
      ];
    }

    // Additional filters
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (clientId) filter.clientId = clientId;

    const skip = (page - 1) * limit;

    // Get projects with stats
    const projects = await Project.aggregate([
      { $match: filter },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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
                  86400000 // milliseconds in a day
                ]
              },
              else: null
            }
          },
          createdByDetails: { $arrayElemAt: ['$createdByDetails', 0] },
          clientDetails: { $arrayElemAt: ['$clientDetails', 0] }
        }
      },
      {
        $project: {
          tasks: 0 // Remove tasks array from final result
        }
      }
    ]);

    const total = await Project.countDocuments(filter);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Projects retrieved successfully',
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/projects - Create new project
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

    // Only certain roles can create projects
    if (!['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to create projects'
      }, { status: 403 });
    }

    const data = await req.json();
    const {
      name,
      description,
      status = 'planning',
      priority,
      startDate,
      dueDate,
      estimatedHours,
      budget,
      clientId,
      teamMembers = [],
      tags = [],
      attachments = []
    } = data;

    if (!name || !priority) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Name and priority are required'
      }, { status: 400 });
    }

    // Validate team members
    if (teamMembers.length > 0) {
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
    }

    // Validate client if provided
    if (clientId) {
      const client = await User.findOne({ 
        _id: clientId,
        role: 'client',
        isActive: true
      });

      if (!client) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Invalid client ID'
        }, { status: 400 });
      }
    }

    // Add creator as project manager if not already in team
    const creatorInTeam = teamMembers.find((m: any) => m.userId === authResult.user.userId);
    if (!creatorInTeam) {
      teamMembers.unshift({
        userId: authResult.user.userId,
        role: 'manager',
        joinedAt: new Date(),
        permissions: ['all']
      });
    }

    // Create project
    const project = new Project({
      name,
      description,
      status,
      priority,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      budget,
      createdBy: authResult.user.userId,
      clientId,
      teamMembers,
      tags,
      attachments,
      progress: 0,
      actualHours: 0,
      spentBudget: 0,
      isArchived: false
    });

    await project.save();

    // Populate related data
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email profileImage')
      .lean();

    return NextResponse.json<IApiResponse<IProject>>({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    }, { status: 201 });

  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}