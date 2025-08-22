import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Attendance, User } from '@/models';
import { IApiResponse, IAttendance, IAttendanceWithDetails, IAttendanceFilter, ICheckInOut } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/attendance - Get attendance records with filters
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
    const search = searchParams.get('search') || '';
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const shift = searchParams.get('shift');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const isRemote = searchParams.get('isRemote');

    // Build filter based on user role
    const filter: any = {};

    // Role-based filtering
    if (authResult.user.role === 'employee') {
      filter.employeeId = authResult.user.userId;
    } else if (!['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    // Additional filters
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (shift) filter.shift = shift;
    if (isRemote !== null) filter.isRemote = isRemote === 'true';

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    // Get attendance with employee details
    const attendanceRecords = await Attendance.aggregate([
      { $match: filter },
      { $sort: { date: -1 } },
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
        $addFields: {
          employeeDetails: {
            $let: {
              vars: { employee: { $arrayElemAt: ['$employeeDetails', 0] } },
              in: {
                id: '$$employee._id',
                name: '$$employee.name',
                email: '$$employee.email',
                employeeId: '$$employee.employeeId',
                department: '$$employee.department',
                profileImage: '$$employee.profileImage'
              }
            }
          }
        }
      }
    ]);

    // Search functionality
    if (search && ['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      const searchFilter = {
        ...filter,
        $or: [
          { 'employeeDetails.name': { $regex: search, $options: 'i' } },
          { 'employeeDetails.email': { $regex: search, $options: 'i' } },
          { 'employeeDetails.employeeId': { $regex: search, $options: 'i' } },
          { 'employeeDetails.department': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await Attendance.countDocuments(filter);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        attendance: attendanceRecords,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/attendance - Create attendance record or handle check-in/out
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
    const { action, ...attendanceData } = data;

    // Handle check-in/out actions
    if (action === 'check-in' || action === 'check-out') {
      return await handleCheckInOut(authResult.user.userId, action, attendanceData);
    }

    // Handle manual attendance creation (admin/hr only)
    if (!['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to create attendance records'
      }, { status: 403 });
    }

    const {
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      shift,
      isRemote = false,
      notes
    } = attendanceData;

    if (!employeeId || !date || !status || !shift) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Employee ID, date, status, and shift are required'
      }, { status: 400 });
    }

    // Validate employee
    const employee = await User.findOne({ 
      _id: employeeId,
      isActive: true
    });

    if (!employee) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Invalid employee ID'
      }, { status: 400 });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Attendance record already exists for this date'
      }, { status: 409 });
    }

    // Calculate working hours if both check-in and check-out are provided
    let totalHours = 0;
    let workingHours = 0;
    if (checkIn && checkOut) {
      const checkInTime = new Date(checkIn);
      const checkOutTime = new Date(checkOut);
      totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      workingHours = totalHours; // This would be adjusted for breaks
    }

    // Create attendance record
    const attendance = new Attendance({
      employeeId,
      date: new Date(date),
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      status,
      shift,
      isRemote,
      notes,
      totalHours,
      workingHours,
      breaks: [],
      namaz: [],
      totalBreakMinutes: 0,
      totalNamazMinutes: 0,
      overtimeHours: Math.max(0, workingHours - 8) // Assuming 8-hour standard
    });

    await attendance.save();

    // Populate employee details
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'name email employeeId department profileImage')
      .lean();

    return NextResponse.json<IApiResponse<IAttendance>>({
      success: true,
      message: 'Attendance record created successfully',
      data: populatedAttendance
    }, { status: 201 });

  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to handle check-in/out
async function handleCheckInOut(userId: string, action: 'check-in' | 'check-out', data: any) {
  const { location, notes, isRemote = false } = data;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find or create today's attendance record
  let attendance = await Attendance.findOne({
    employeeId: userId,
    date: today
  });

  if (action === 'check-in') {
    if (attendance && attendance.checkIn) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Already checked in for today'
      }, { status: 400 });
    }

    if (!attendance) {
      // Create new attendance record
      attendance = new Attendance({
        employeeId: userId,
        date: today,
        checkIn: new Date(),
        checkInLocation: location,
        checkInNote: notes,
        status: isRemote ? 'remote' : 'present',
        shift: 'morning', // Default, could be determined by time
        isRemote,
        breaks: [],
        namaz: []
      });
    } else {
      // Update existing record
      attendance.checkIn = new Date();
      attendance.checkInLocation = location;
      attendance.checkInNote = notes;
      attendance.status = isRemote ? 'remote' : 'present';
      attendance.isRemote = isRemote;
    }

    await attendance.save();

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Checked in successfully',
      data: { checkInTime: attendance.checkIn }
    });
  }

  if (action === 'check-out') {
    if (!attendance || !attendance.checkIn) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Must check in first'
      }, { status: 400 });
    }

    if (attendance.checkOut) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Already checked out for today'
      }, { status: 400 });
    }

    // Update attendance with check-out
    attendance.checkOut = new Date();
    attendance.checkOutLocation = location;
    attendance.checkOutNote = notes;

    // Calculate working hours
    const totalHours = (attendance.checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
    const totalBreakMinutes = attendance.totalBreakMinutes || 0;
    const totalNamazMinutes = attendance.totalNamazMinutes || 0;
    const workingHours = totalHours - (totalBreakMinutes + totalNamazMinutes) / 60;

    attendance.totalHours = totalHours;
    attendance.workingHours = workingHours;
    attendance.overtimeHours = Math.max(0, workingHours - 8);

    await attendance.save();

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Checked out successfully',
      data: { 
        checkOutTime: attendance.checkOut,
        totalHours: attendance.totalHours,
        workingHours: attendance.workingHours
      }
    });
  }
}