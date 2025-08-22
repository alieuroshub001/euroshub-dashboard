import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { IApiResponse, IUserProfile } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/profile/[id] - Get specific user profile
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
    const isOwnProfile = id === authResult.user.userId;

    // Check permissions - users can view their own profile, admins can view any
    if (!isOwnProfile && !['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const user = await User.findById(id).select('-password');
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

  } catch (error) {
    console.error('Profile GET [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/profile/[id] - Update specific user profile
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
    const isOwnProfile = id === authResult.user.userId;

    // Check permissions - users can edit their own profile, admins can edit any
    if (!isOwnProfile && !['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const data = await req.json();
    const {
      name,
      phone,
      bio,
      department,
      position,
      dateOfBirth,
      dateOfJoining,
      address,
      emergencyContact,
      skills,
      certifications,
      socialLinks,
      profileImage,
      role,
      isActive,
      employeeId
    } = data;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (department !== undefined) user.department = department;
    if (position !== undefined) user.position = position;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (dateOfJoining) user.dateOfJoining = new Date(dateOfJoining);
    if (address) user.address = address;
    if (emergencyContact) user.emergencyContact = emergencyContact;
    if (skills) user.skills = skills;
    if (certifications) user.certifications = certifications;
    if (socialLinks) user.socialLinks = socialLinks;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Admin-only fields
    if (!isOwnProfile && ['superadmin', 'admin', 'hr'].includes(authResult.user.role)) {
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (employeeId !== undefined) user.employeeId = employeeId;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    return NextResponse.json<IApiResponse<IUserProfile>>({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser?.toObject()
    });

  } catch (error) {
    console.error('Profile PUT [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/profile/[id] - Delete user profile (admin only)
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
    const isOwnProfile = id === authResult.user.userId;

    // Only admins can delete users, and users cannot delete themselves
    if (!['superadmin', 'admin'].includes(authResult.user.role) || isOwnProfile) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions or cannot delete own profile'
      }, { status: 403 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Soft delete by deactivating instead of hard delete to maintain data integrity
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'User profile deactivated successfully'
    });

  } catch (error) {
    console.error('Profile DELETE [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}