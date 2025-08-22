import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { TimeTrackerSession, TimeTrackerSettings, WorkDiary } from '@/models';
import { IApiResponse, ITimeTrackerSession, ITimeTrackerSettings } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/tracking - Get time tracker sessions
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
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
    const employeeId = searchParams.get('employeeId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build filter based on user role
    const filter: any = {};

    if (authResult.user.role === 'employee') {
      filter.employeeId = authResult.user.userId;
    } else if (!['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    if (employeeId) filter.employeeId = employeeId;
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.startTime = {};
      if (dateFrom) filter.startTime.$gte = new Date(dateFrom);
      if (dateTo) filter.startTime.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const sessions = await TimeTrackerSession.aggregate([
      { $match: filter },
      { $sort: { startTime: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employeeDetails'
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
          employeeDetails: { $arrayElemAt: ['$employeeDetails', 0] },
          projectDetails: { $arrayElemAt: ['$projectDetails', 0] }
        }
      }
    ]);

    const total = await TimeTrackerSession.countDocuments(filter);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Time tracker sessions retrieved successfully',
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Tracking GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/tracking - Start/stop time tracking session
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const data = await req.json();
    const { action, ...sessionData } = data;

    if (action === 'start') {
      const { title, description, projectId, deviceInfo } = sessionData;

      if (!title || !deviceInfo) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Title and device info are required'
        }, { status: 400 });
      }

      // Check if user already has a running session
      const runningSession = await TimeTrackerSession.findOne({
        employeeId: authResult.user.userId,
        status: 'running'
      });

      if (runningSession) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Please stop current session before starting a new one'
        }, { status: 400 });
      }

      // Create new session
      const session = new TimeTrackerSession({
        employeeId: authResult.user.userId,
        projectId,
        title,
        description,
        startTime: new Date(),
        status: 'running',
        deviceInfo,
        screenshots: [],
        activityLevels: [],
        tasksCompleted: [],
        totalHours: 0,
        productiveHours: 0,
        idleHours: 0,
        averageActivityLevel: 0,
        totalKeystrokes: 0,
        totalMouseClicks: 0,
        lastActive: new Date(),
        isApproved: false,
        totalEarnings: 0,
        isManual: false
      });

      await session.save();

      return NextResponse.json<IApiResponse<ITimeTrackerSession>>({
        success: true,
        message: 'Time tracking session started',
        data: session.toObject()
      }, { status: 201 });
    }

    if (action === 'stop') {
      const { sessionId } = sessionData;

      if (!sessionId) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Session ID is required'
        }, { status: 400 });
      }

      const session = await TimeTrackerSession.findOne({
        _id: sessionId,
        employeeId: authResult.user.userId,
        status: 'running'
      });

      if (!session) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Active session not found'
        }, { status: 404 });
      }

      // Stop session
      session.endTime = new Date();
      session.status = 'stopped';
      session.totalHours = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
      
      await session.save();

      return NextResponse.json<IApiResponse>({
        success: true,
        message: 'Time tracking session stopped',
        data: { totalHours: session.totalHours }
      });
    }

    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Tracking POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}