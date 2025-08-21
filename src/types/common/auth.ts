// src/types/common/auth.ts
import { UserRole } from './index';

// Session types
export interface ISessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface ISession {
  user: ISessionUser;
  expires: string;
  accessToken: string;
  refreshToken?: string;
}

// OTP types
export interface IOTP {
  id: string;
  email: string;
  otp: string;
  type: 'verification' | 'password-reset' | 'login';
  expiresAt: Date;
  createdAt: Date;
}

// Token types
export interface IPasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IVerificationToken {
  id: string;
  email: string;
  token: string;
  type: 'email-verification' | 'password-reset';
  expiresAt: Date;
  createdAt: Date;
}