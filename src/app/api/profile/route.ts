// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { IApiResponse, IUserProfile, IUserFilter } from '@/types';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET /api/profile - Get current user profile or list users (for admin)
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
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');

    // If no query params, return current user profile
    if (!searchParams.toString() || (searchParams.get('page') === '1' && searchParams.get('limit') === '10' && !search && !role && !department && !isActive)) {
      const user = await User.findById(authResult.user.userId).select('-password');
      if (!user) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }

      return NextResponse.json<IApiResponse<IUserProfile>>({
        success: true,
        message: 'Profile retrieved successfully',
        data: user.toObject()
      });
    }

    // List users (admin only)
    if (!['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== null) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/profile - Update current user profile
export async function PUT(req: NextRequest) {
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
      name,
      phone,
      bio,
      department,
      position,
      dateOfBirth,
      address,
      emergencyContact,
      skills,
      certifications,
      socialLinks,
      profileImage
    } = data;

    const user = await User.findById(authResult.user.userId);
    if (!user) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (department) user.department = department;
    if (position) user.position = position;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (address) user.address = address;
    if (emergencyContact) user.emergencyContact = emergencyContact;
    if (skills) user.skills = skills;
    if (certifications) user.certifications = certifications;
    if (socialLinks) user.socialLinks = socialLinks;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    return NextResponse.json<IApiResponse<IUserProfile>>({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser?.toObject()
    });

  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/profile - Create new user (admin only)
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

    // Only admins can create users
    if (!['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const data = await req.json();
    const { name, email, role = 'employee', password, ...profileData } = data;

    if (!name || !email || !password) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Name, email, and password are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      emailVerified: true, // Admin created users are pre-verified
      isActive: true,
      ...profileData
    });

    await user.save();

    const newUser = await User.findById(user._id).select('-password');

    return NextResponse.json<IApiResponse<IUserProfile>>({
      success: true,
      message: 'User created successfully',
      data: newUser?.toObject()
    }, { status: 201 });

  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}