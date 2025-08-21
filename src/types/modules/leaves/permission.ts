// src/types/modules/leaves/permission.ts
import { UserRole } from '../../common';
import { PermissionAction } from '../../common/permissions';

// Leave permissions by role
export const LEAVE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  hr: ['create', 'read', 'update', 'approve', 'export'],
  employee: ['create', 'read', 'update', 'delete'], // Own leaves only
  client: [], // No access to leave data
};

// Leave type permissions by role
export const LEAVE_TYPE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'emergency', 'other'],
  admin: ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'emergency', 'other'],
  hr: ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'emergency', 'other'],
  employee: ['vacation', 'sick', 'personal', 'emergency'], // Limited leave types for employees
  client: [],
};

// Leave field permissions by role
export const LEAVE_FIELD_PERMISSIONS: Record<UserRole, {
  canEdit: string[];
  canView: string[];
  restricted: string[];
}> = {
  superadmin: {
    canEdit: ['*'], // All fields
    canView: ['*'],
    restricted: [],
  },
  admin: {
    canEdit: ['type', 'startDate', 'endDate', 'duration', 'totalDays', 'totalHours', 'status', 'reviewedBy', 'reviewedAt', 'reviewNote', 'isEmergency'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: ['status', 'reviewedBy', 'reviewedAt', 'reviewNote', 'totalDays', 'totalHours'],
    canView: ['*'],
    restricted: [],
  },
  employee: {
    canEdit: ['type', 'startDate', 'endDate', 'duration', 'reason', 'attachments', 'isEmergency', 'contactDuringLeave', 'delegatedTo', 'delegationNotes'],
    canView: ['employeeId', 'type', 'startDate', 'endDate', 'duration', 'totalDays', 'status', 'reason', 'reviewNote', 'attachments', 'isEmergency'],
    restricted: ['reviewedBy', 'reviewedAt'],
  },
  client: {
    canEdit: [],
    canView: [],
    restricted: ['*'], // All fields restricted
  },
};

// Leave action permissions
export const LEAVE_ACTION_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['apply', 'view-all', 'edit', 'delete', 'approve', 'reject', 'cancel', 'export', 'manage-policies'],
  admin: ['apply', 'view-all', 'edit', 'delete', 'approve', 'reject', 'cancel', 'export', 'manage-policies'],
  hr: ['apply', 'view-all', 'edit', 'approve', 'reject', 'cancel', 'export'],
  employee: ['apply', 'view-own', 'edit-own', 'delete-own', 'cancel-own'],
  client: [],
};

// Leave policy permissions by role
export const LEAVE_POLICY_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete'],
  admin: ['create', 'read', 'update', 'delete'],
  hr: ['read'],
  employee: [], // No access to policy management
  client: [],
};

// Check if a role can perform an action on leave
export const canPerformLeaveAction = (
  role: UserRole,
  action: PermissionAction | string,
  isOwnLeave: boolean = false,
  leaveStatus?: string
): boolean => {
  // Superadmin can do everything
  if (role === 'superadmin') return true;
  
  // Admin can do everything
  if (role === 'admin') return true;
  
  // HR permissions
  if (role === 'hr') {
    const hrActions = LEAVE_PERMISSIONS.hr;
    return hrActions.includes(action as PermissionAction) || LEAVE_ACTION_PERMISSIONS.hr.includes(action);
  }
  
  // Employee permissions (only on own leaves)
  if (role === 'employee' && isOwnLeave) {
    // Additional restrictions based on leave status
    if (leaveStatus === 'approved' && ['update', 'delete'].includes(action as string)) {
      return false; // Cannot edit or delete approved leaves
    }
    
    if (leaveStatus === 'cancelled' && action !== 'read') {
      return false; // Can only read cancelled leaves
    }
    
    const employeeActions = LEAVE_PERMISSIONS.employee;
    return employeeActions.includes(action as PermissionAction) || LEAVE_ACTION_PERMISSIONS.employee.includes(action);
  }
  
  // Client has no access to leave data
  if (role === 'client') return false;
  
  return false;
};

// Check if a role can use a specific leave type
export const canUseLeaveType = (role: UserRole, leaveType: string): boolean => {
  return LEAVE_TYPE_PERMISSIONS[role]?.includes(leaveType) || false;
};

// Check if a role can manage leave policies
export const canManageLeavePolicies = (role: UserRole, action: PermissionAction): boolean => {
  return LEAVE_POLICY_PERMISSIONS[role]?.includes(action) || false;
};

// Check if a role can view leave balance
export const canViewLeaveBalance = (role: UserRole, isOwnBalance: boolean = false): boolean => {
  if (role === 'superadmin' || role === 'admin' || role === 'hr') return true;
  if (role === 'employee' && isOwnBalance) return true;
  return false;
};