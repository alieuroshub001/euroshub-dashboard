// src/types/modules/timetracker/permission.ts
import { UserRole } from '../../common';
import { PermissionAction } from '../../common/permissions';

// Timetracker permissions by role
export const TIMETRACKER_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  hr: ['read', 'update', 'approve', 'export'],
  employee: ['create', 'read', 'update', 'delete'], // Own sessions only
  client: [], // No access to timetracker data
};

// Timetracker field permissions by role
export const TIMETRACKER_FIELD_PERMISSIONS: Record<UserRole, {
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
    canEdit: ['title', 'description', 'projectId', 'status', 'notes', 'isApproved', 'approvedBy', 'approvedAt', 'rejectionReason'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: ['isApproved', 'approvedBy', 'approvedAt', 'rejectionReason'],
    canView: ['employeeId', 'projectId', 'title', 'startTime', 'endTime', 'totalHours', 'productiveHours', 'averageActivityLevel', 'isApproved'],
    restricted: ['screenshots', 'activityLevels', 'deviceInfo', 'hourlyRate', 'totalEarnings'],
  },
  employee: {
    canEdit: ['title', 'description', 'projectId', 'notes'],
    canView: ['employeeId', 'projectId', 'title', 'description', 'startTime', 'endTime', 'totalHours', 'productiveHours', 'averageActivityLevel', 'status', 'isApproved'],
    restricted: ['screenshots', 'activityLevels', 'deviceInfo', 'hourlyRate', 'totalEarnings', 'approvedBy', 'approvedAt'],
  },
  client: {
    canEdit: [],
    canView: [],
    restricted: ['*'], // All fields restricted
  },
};

// Timetracker action permissions
export const TIMETRACKER_ACTION_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['start-session', 'stop-session', 'view-all', 'edit', 'delete', 'approve', 'reject', 'export', 'view-screenshots'],
  admin: ['start-session', 'stop-session', 'view-all', 'edit', 'delete', 'approve', 'reject', 'export', 'view-screenshots'],
  hr: ['view-all', 'approve', 'reject', 'export'],
  employee: ['start-session', 'stop-session', 'view-own', 'edit-own', 'delete-own'],
  client: [],
};

// Screenshot permissions by role
export const SCREENSHOT_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete'],
  admin: ['create', 'read', 'update', 'delete'],
  hr: ['read'],
  employee: ['create', 'read'], // Own screenshots only
  client: [],
};

// Check if a role can perform an action on timetracker
export const canPerformTimetrackerAction = (
  role: UserRole,
  action: PermissionAction | string,
  isOwnSession: boolean = false
): boolean => {
  // Superadmin can do everything
  if (role === 'superadmin') return true;
  
  // Admin can do everything
  if (role === 'admin') return true;
  
  // HR permissions
  if (role === 'hr') {
    const hrActions = TIMETRACKER_PERMISSIONS.hr;
    return hrActions.includes(action as PermissionAction) || TIMETRACKER_ACTION_PERMISSIONS.hr.includes(action);
  }
  
  // Employee permissions (only on own sessions)
  if (role === 'employee' && isOwnSession) {
    const employeeActions = TIMETRACKER_PERMISSIONS.employee;
    return employeeActions.includes(action as PermissionAction) || TIMETRACKER_ACTION_PERMISSIONS.employee.includes(action);
  }
  
  // Client has no access to timetracker
  if (role === 'client') return false;
  
  return false;
};

// Check if a role can view screenshots
export const canViewScreenshots = (role: UserRole, isOwnSession: boolean = false): boolean => {
  if (['superadmin', 'admin'].includes(role)) return true;
  if (role === 'hr') return true;
  if (role === 'employee' && isOwnSession) return true;
  return false;
};

// Check if a role can approve sessions
export const canApproveSessions = (role: UserRole): boolean => {
  return ['superadmin', 'admin', 'hr'].includes(role);
};

// Check if a role can view productivity metrics
export const canViewProductivityMetrics = (role: UserRole, isOwnData: boolean = false): boolean => {
  if (['superadmin', 'admin', 'hr'].includes(role)) return true;
  if (role === 'employee' && isOwnData) return true;
  return false;
};