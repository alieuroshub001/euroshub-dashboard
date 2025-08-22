import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Leave, User } from '@/models';
import { IApiResponse, ILeave, ILeaveWithDetails } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/leaves - Get leave requests with filters
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const employeeId = searchParams.get('employeeId');

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

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (employeeId) filter.employeeId = employeeId;

    const skip = (page - 1) * limit;

    const leaves = await Leave.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
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
          from: 'users',
          localField: 'reviewedBy',
          foreignField: '_id',
          as: 'reviewerDetails'
        }
      },
      {
        $addFields: {
          employeeDetails: { $arrayElemAt: ['$employeeDetails', 0] },
          reviewerDetails: { $arrayElemAt: ['$reviewerDetails', 0] }
        }
      }
    ]);

    const total = await Leave.countDocuments(filter);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: {
        leaves,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Leaves GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/leaves - Create leave request
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
    const {
      type,
      startDate,
      endDate,
      duration,
      totalDays,
      totalHours,
      reason,
      isEmergency = false,
      contactDuringLeave,
      delegatedTo,
      delegationNotes,
      attachments = []
    } = data;

    if (!type || !startDate || !endDate || !duration || !totalDays || !reason) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Type, dates, duration, total days, and reason are required'
      }, { status: 400 });
    }

    // Create leave request
    const leave = new Leave({
      employeeId: authResult.user.userId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration,
      totalDays,
      totalHours,
      reason,
      status: 'pending',
      isEmergency,
      contactDuringLeave,
      delegatedTo,
      delegationNotes,
      attachments
    });

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'name email employeeId department')
      .lean();

    return NextResponse.json<IApiResponse<ILeave>>({
      success: true,
      message: 'Leave request submitted successfully',
      data: populatedLeave
    }, { status: 201 });

  } catch (error) {
    console.error('Leaves POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}