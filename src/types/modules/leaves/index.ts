import { IBaseDocument } from '../../common';
import { IAttachment } from '../../common/uploads';

// Leave types
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'emergency' | 'other';

// Leave status
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

// Leave duration type
export type LeaveDuration = 'full_day' | 'half_day' | 'hours';

// Leave base interface
export interface ILeaveBase {
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  duration: LeaveDuration;
  totalDays: number;
  totalHours?: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNote?: string;
  attachments: IAttachment[];
  isEmergency: boolean;
  contactDuringLeave?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  delegatedTo?: string; // User ID who will handle responsibilities
  delegationNotes?: string;
}

// Leave document
export interface ILeave extends ILeaveBase, IBaseDocument {}

// Leave with details
export interface ILeaveWithDetails extends ILeave {
  employeeDetails: {
    id: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
    profileImage?: string;
  };
  reviewerDetails?: {
    id: string;
    name: string;
    email: string;
  };
  delegatedToDetails?: {
    id: string;
    name: string;
    email: string;
  };
  canEdit: boolean;
  canCancel: boolean;
  isOverlapping: boolean;
  remainingLeaves: {
    vacation: number;
    sick: number;
    personal: number;
  };
}

// Leave balance
export interface ILeaveBalance {
  employeeId: string;
  year: number;
  vacation: {
    allocated: number;
    used: number;
    remaining: number;
    pending: number;
  };
  sick: {
    allocated: number;
    used: number;
    remaining: number;
    pending: number;
  };
  personal: {
    allocated: number;
    used: number;
    remaining: number;
    pending: number;
  };
  other: {
    used: number;
    pending: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Leave policy
export interface ILeavePolicy {
  id: string;
  name: string;
  description?: string;
  rules: {
    vacation: {
      annualAllocation: number;
      maxConsecutiveDays?: number;
      advanceNoticeRequired: number; // days
      carryForward?: number;
    };
    sick: {
      annualAllocation: number;
      maxConsecutiveDays?: number;
      documentationRequired?: number; // days
    };
    personal: {
      annualAllocation: number;
      maxConsecutiveDays?: number;
      advanceNoticeRequired: number;
    };
  };
  applicableRoles: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Leave filters
export interface ILeaveFilter {
  employeeId?: string[];
  type?: LeaveType[];
  status?: LeaveStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  department?: string[];
  reviewedBy?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

// Leave stats
export interface ILeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  byType: Record<LeaveType, number>;
  byMonth: Array<{
    month: number;
    count: number;
    approved: number;
  }>;
}