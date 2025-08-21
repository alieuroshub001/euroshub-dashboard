//types/modules/profile/index.ts
import { IBaseDocument, ITimestamps } from '../../common';
import { UserRole } from '../../common';
import { IAttachment } from '../../common/uploads';

// User base interface
export interface IUserBase {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  employeeId?: string;
  emailVerified: boolean;
  isActive: boolean;
}

// User with password (for auth)
export interface IUserWithPassword extends IUserBase {
  password: string;
}

// User document (MongoDB)
export interface IUser extends IUserBase, IBaseDocument {}

// User profile (extended info)
export interface IUserProfile extends IUser {
  bio?: string;
  department?: string;
  position?: string;
  dateOfJoining?: Date;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateUrl?: string;
  }>;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
}

// Profile update interface
export interface IProfileUpdate {
  name?: string;
  phone?: string;
  bio?: string;
  department?: string;
  position?: string;
  address?: IUserProfile['address'];
  emergencyContact?: IUserProfile['emergencyContact'];
  skills?: string[];
  socialLinks?: IUserProfile['socialLinks'];
}

// Profile filters
export interface IUserFilter {
  role?: UserRole[];
  department?: string[];
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}