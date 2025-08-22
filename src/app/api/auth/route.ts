import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User, OTP } from '@/models';
import { IApiResponse, IUserWithPassword, IOTP } from '@/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/email';
import { generateOTP } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/auth - Handle authentication actions
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { action, ...data } = await req.json();

    switch (action) {
      case 'register':
        return await handleRegister(data);
      case 'login':
        return await handleLogin(data);
      case 'verify-email':
        return await handleEmailVerification(data);
      case 'forgot-password':
        return await handleForgotPassword(data);
      case 'reset-password':
        return await handleResetPassword(data);
      case 'resend-verification':
        return await handleResendVerification(data);
      default:
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Invalid action',
          error: 'Action not supported'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleRegister(data: any) {
  const { name, email, password, role = 'employee' } = data;

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
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Generate verification token
  const verificationToken = generateOTP();

  // Create user
  const user = new User({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    verificationToken,
    emailVerified: false,
    isActive: true
  });

  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your email address',
      template: 'email-verification',
      data: {
        name,
        verificationToken,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}&email=${email}`
      }
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }

  return NextResponse.json<IApiResponse>({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    }
  }, { status: 201 });
}

async function handleLogin(data: any) {
  const { email, password } = data;

  if (!email || !password) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Email and password are required'
    }, { status: 400 });
  }

  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 });
  }

  // Check if user is active
  if (!user.isActive) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Account is deactivated. Please contact administrator.'
    }, { status: 403 });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const response = NextResponse.json<IApiResponse>({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified
      },
      token
    }
  });

  // Set HTTP-only cookie
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  return response;
}

async function handleEmailVerification(data: any) {
  const { email, token } = data;

  if (!email || !token) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Email and verification token are required'
    }, { status: 400 });
  }

  const user = await User.findOne({ 
    email: email.toLowerCase(),
    verificationToken: token
  });

  if (!user) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Invalid verification token'
    }, { status: 400 });
  }

  // Update user
  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return NextResponse.json<IApiResponse>({
    success: true,
    message: 'Email verified successfully'
  });
}

async function handleForgotPassword(data: any) {
  const { email } = data;

  if (!email) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Email is required'
    }, { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal if user exists or not
    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link.'
    });
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Save OTP
  await OTP.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      email: email.toLowerCase(),
      otp,
      type: 'password-reset',
      expiresAt,
      referenceEmail: email.toLowerCase()
    },
    { upsert: true, new: true }
  );

  // Send reset email
  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        name: user.name,
        otp,
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?email=${email}&otp=${otp}`
      }
    });
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
  }

  return NextResponse.json<IApiResponse>({
    success: true,
    message: 'If an account with this email exists, you will receive a password reset link.'
  });
}

async function handleResetPassword(data: any) {
  const { email, otp, newPassword } = data;

  if (!email || !otp || !newPassword) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Email, OTP, and new password are required'
    }, { status: 400 });
  }

  // Verify OTP
  const otpRecord = await OTP.findOne({
    email: email.toLowerCase(),
    otp,
    type: 'password-reset',
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Invalid or expired OTP'
    }, { status: 400 });
  }

  // Find user and update password
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'User not found'
    }, { status: 404 });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();

  // Delete used OTP
  await OTP.deleteOne({ _id: otpRecord._id });

  return NextResponse.json<IApiResponse>({
    success: true,
    message: 'Password reset successfully'
  });
}

async function handleResendVerification(data: any) {
  const { email } = data;

  if (!email) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Email is required'
    }, { status: 400 });
  }

  const user = await User.findOne({ 
    email: email.toLowerCase(),
    emailVerified: false
  });

  if (!user) {
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'User not found or already verified'
    }, { status: 404 });
  }

  // Generate new verification token
  const verificationToken = generateOTP();
  user.verificationToken = verificationToken;
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your email address',
      template: 'email-verification',
      data: {
        name: user.name,
        verificationToken,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}&email=${email}`
      }
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }

  return NextResponse.json<IApiResponse>({
    success: true,
    message: 'Verification email sent successfully'
  });
}

// POST /api/auth/logout
export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json<IApiResponse>({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear auth cookie
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}