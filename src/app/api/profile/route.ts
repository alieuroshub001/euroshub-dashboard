// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/cloudinary';
import { 
  canPerformProfileAction, 
  canViewProfileField, 
  canEditProfileField,
  canChangeUserRole 
} from '@/types/modules/profile/permission';
import { IUserProfile, IProfileUpdate } from '@/types/modules/profile';
import { UserRole } from '@/types/common';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// GET /api/profile - Get profile(s)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = session.user as AuthenticatedUser;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'view-own';

    // If userId is provided, get specific user profile
    if (userId) {
      const isOwnProfile = userId === currentUser.id;
      
      // Check permission to view this profile
      if (!canPerformProfileAction(currentUser.role, 'read', isOwnProfile)) {
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const user = await User.findById(userId).lean();
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Filter fields based on permissions
      const filteredUser = filterUserFields(user as unknown as IUserProfile, currentUser.role, isOwnProfile);

      return NextResponse.json({
        success: true,
        data: {
          profile: filteredUser,
          isOwnProfile,
          permissions: {
            canEdit: canPerformProfileAction(currentUser.role, 'update', isOwnProfile),
            canDelete: canPerformProfileAction(currentUser.role, 'delete', isOwnProfile),
            canViewAll: canPerformProfileAction(currentUser.role, 'read', false)
          }
        }
      });
    }

    // Get current user's own profile
    const user = await User.findById(currentUser.id).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const filteredUser = filterUserFields(user as unknown as IUserProfile, currentUser.role, true);

    return NextResponse.json({
      success: true,
      data: {
        profile: filteredUser,
        isOwnProfile: true,
        permissions: {
          canEdit: true,
          canDelete: false, // Users cannot delete their own profiles
          canViewAll: canPerformProfileAction(currentUser.role, 'read', false)
        }
      }
    });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update profile
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = session.user as AuthenticatedUser;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || currentUser.id;
    const isOwnProfile = userId === currentUser.id;

    // Check permission to update this profile
    if (!canPerformProfileAction(currentUser.role, 'update', isOwnProfile)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type');
    let updateData: Partial<IProfileUpdate & { role?: UserRole; profileImage?: string }>;

    // Handle multipart form data (for image uploads)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      updateData = {};

      // Handle profile image upload
      const imageFile = formData.get('profileImage') as File | null;
      if (imageFile && imageFile.size > 0) {
        // Validate image file
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { success: false, message: 'Only image files are allowed' },
            { status: 400 }
          );
        }

        if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
          return NextResponse.json(
            { success: false, message: 'Image file must be less than 5MB' },
            { status: 400 }
          );
        }

        try {
          // Convert file to buffer
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Get current user to delete old profile image
          const existingUser = await User.findById(userId);
          if (existingUser?.profileImage) {
            // Extract public_id from URL and delete old image
            const urlParts = existingUser.profileImage.split('/');
            const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename.ext
            const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // remove extension
            await deleteFile(publicId, 'image');
          }

          // Upload new image
          const uploadResult = await uploadFile(buffer, {
            folder: 'profile-images',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            tags: ['profile', 'user-avatar']
          }, currentUser.id);

          if (uploadResult.attachments.length > 0) {
            updateData.profileImage = uploadResult.attachments[0].secure_url;
          } else {
            return NextResponse.json(
              { success: false, message: 'Failed to upload image' },
              { status: 500 }
            );
          }
        } catch (error) {
          console.error('Image upload error:', error);
          return NextResponse.json(
            { success: false, message: 'Failed to upload image' },
            { status: 500 }
          );
        }
      }

      // Parse other form fields
      for (const [key, value] of formData.entries()) {
        if (key !== 'profileImage' && typeof value === 'string') {
          if (key.includes('.')) {
            // Handle nested objects like address.street
            const [parentKey, childKey] = key.split('.');
            if (!updateData[parentKey as keyof typeof updateData]) {
              (updateData as any)[parentKey] = {};
            }
            (updateData as any)[parentKey][childKey] = value || undefined;
          } else if (key === 'skills') {
            // Handle array fields
            updateData.skills = value ? value.split(',').map(s => s.trim()) : [];
          } else {
            (updateData as any)[key] = value || undefined;
          }
        }
      }
    } else {
      // Handle JSON data
      updateData = await request.json();
    }

    // Validate and filter update data based on permissions
    const allowedUpdates: Partial<IUserProfile> = {};
    
    for (const [key, value] of Object.entries(updateData)) {
      if (canEditProfileField(currentUser.role, key, isOwnProfile)) {
        // Special handling for role changes
        if (key === 'role' && value) {
          if (!canChangeUserRole(currentUser.role, value as UserRole)) {
            return NextResponse.json(
              { success: false, message: 'Cannot change to this role' },
              { status: 403 }
            );
          }
        }
        
        (allowedUpdates as any)[key] = value;
      }
    }

    // Validate required fields for certifications
    if (allowedUpdates.certifications) {
      for (const cert of allowedUpdates.certifications) {
        if (!cert.name || !cert.issuer || !cert.issueDate) {
          return NextResponse.json(
            { success: false, message: 'Certification name, issuer, and issue date are required' },
            { status: 400 }
          );
        }
      }
    }

    // Validate emergency contact if provided
    if (allowedUpdates.emergencyContact) {
      const ec = allowedUpdates.emergencyContact;
      if (!ec.name || !ec.relationship || !ec.phone) {
        return NextResponse.json(
          { success: false, message: 'Emergency contact name, relationship, and phone are required' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...allowedUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Filter response based on permissions
    const filteredUser = filterUserFields(updatedUser as unknown as IUserProfile, currentUser.role, isOwnProfile);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: filteredUser }
    });

  } catch (error) {
    console.error('Profile PUT error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/profile - Delete profile (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = session.user as AuthenticatedUser;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const isOwnProfile = userId === currentUser.id;

    // Check permission to delete profile
    if (!canPerformProfileAction(currentUser.role, 'delete', isOwnProfile)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (isOwnProfile) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own profile' },
        { status: 400 }
      );
    }

    // Get user before deletion to clean up profile image
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete profile image from Cloudinary if exists
    if (user.profileImage) {
      try {
        const urlParts = user.profileImage.split('/');
        const publicIdWithExtension = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
        await deleteFile(publicId, 'image');
      } catch (error) {
        console.warn('Failed to delete profile image:', error);
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User profile deleted successfully'
    });

  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to filter user fields based on permissions
function filterUserFields(user: IUserProfile, userRole: UserRole, isOwnProfile: boolean): Partial<IUserProfile> {
  const filtered: Partial<IUserProfile> = {};

  // Always include basic identifying information
  filtered._id = user._id;
  filtered.name = user.name;

  // Check each field permission
  const fields: (keyof IUserProfile)[] = [
    'email', 'role', 'phone', 'profileImage', 'employeeId', 'emailVerified', 
    'isActive', 'bio', 'department', 'position', 'dateOfJoining', 'dateOfBirth',
    'address', 'emergencyContact', 'skills', 'certifications', 'socialLinks',
    'createdAt', 'updatedAt'
  ];

  for (const field of fields) {
    if (canViewProfileField(userRole, field, isOwnProfile) && user[field] !== undefined) {
      (filtered as any)[field] = user[field];
    }
  }

  return filtered;
}