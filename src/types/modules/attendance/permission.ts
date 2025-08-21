// src/types/modules/attendance/permission.ts
import { UserRole } from '../../common';
import { PermissionAction } from '../../common/permissions';

// Attendance permissions by role
export const ATTENDANCE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  hr: ['create', 'read', 'update', 'approve', 'export'],
  employee: ['create', 'read', 'update'], // Own attendance only
  client: [], // No access to attendance data
};

// Attendance field permissions by role
export const ATTENDANCE_FIELD_PERMISSIONS: Record<UserRole, {
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
    canEdit: ['checkIn', 'checkOut', 'status', 'breaks', 'namaz', 'notes', 'approvedBy', 'approvedAt', 'isRemote'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: ['status', 'breaks', 'namaz', 'notes', 'approvedBy', 'approvedAt'],
    canView: ['*'],
    restricted: [],
  },
  employee: {
    canEdit: ['checkIn', 'checkOut', 'checkInNote', 'checkOutNote', 'breaks', 'namaz', 'notes', 'isRemote'],
    canView: ['employeeId', 'date', 'checkIn', 'checkOut', 'status', 'shift', 'breaks', 'namaz', 'totalHours', 'isRemote'],
    restricted: ['approvedBy', 'approvedAt', 'checkInLocation', 'checkOutLocation'],
  },
  client: {
    canEdit: [],
    canView: [],
    restricted: ['*'], // All fields restricted
  },
};

// Attendance action permissions
export const ATTENDANCE_ACTION_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['check-in', 'check-out', 'edit', 'delete', 'approve', 'export', 'view-all'],
  admin: ['check-in', 'check-out', 'edit', 'delete', 'approve', 'export', 'view-all'],
  hr: ['edit', 'approve', 'export', 'view-all'],
  employee: ['check-in', 'check-out', 'edit-own'],
  client: [],
};

// Check if a role can perform an action on attendance
export const canPerformAttendanceAction = (
  role: UserRole,
  action: PermissionAction | string,
  isOwnAttendance: boolean = false
): boolean => {
  // Superadmin can do everything
  if (role === 'superadmin') return true;
  
  // Admin can do everything except some sensitive operations
  if (role === 'admin') return true;
  
  // HR permissions
  if (role === 'hr') {
    const hrActions = ATTENDANCE_PERMISSIONS.hr;
    return hrActions.includes(action as PermissionAction);
  }
  
  // Employee permissions (only on own attendance)
  if (role === 'employee' && isOwnAttendance) {
    const employeeActions = ATTENDANCE_PERMISSIONS.employee;
    return employeeActions.includes(action as PermissionAction);
  }
  
  // Client has no access to attendance
  if (role === 'client') return false;
  
  return false;
};