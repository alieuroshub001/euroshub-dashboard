// src/types/modules/tasks/permission.ts
import { UserRole } from '../../common';
import { PermissionAction } from '../../common/permissions';

// Task permissions by role
export const TASK_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  hr: ['read', 'export'],
  employee: ['create', 'read', 'update', 'delete'], // Own tasks and assigned tasks
  client: ['read'], // Only tasks in assigned projects
};

// Task field permissions by role
export const TASK_FIELD_PERMISSIONS: Record<UserRole, {
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
    canEdit: ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'estimatedHours', 'dependencies', 'tags', 'attachments'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: [],
    canView: ['title', 'description', 'status', 'priority', 'dueDate', 'progress', 'tags'],
    restricted: ['estimatedHours', 'actualHours', 'assignedTo', 'createdBy'],
  },
  employee: {
    canEdit: ['status', 'progress', 'actualHours', 'comments', 'timeLogs', 'attachments'],
    canView: ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'estimatedHours', 'progress', 'tags', 'comments'],
    restricted: ['createdBy'],
  },
  client: {
    canEdit: [],
    canView: ['title', 'description', 'status', 'priority', 'dueDate', 'progress', 'tags'],
    restricted: ['estimatedHours', 'actualHours', 'assignedTo', 'createdBy', 'comments', 'timeLogs'],
  },
};

// Task action permissions
export const TASK_ACTION_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['create', 'view-all', 'edit', 'delete', 'assign', 'reassign', 'export', 'add-comments', 'log-time'],
  admin: ['create', 'view-all', 'edit', 'delete', 'assign', 'reassign', 'export', 'add-comments', 'log-time'],
  hr: ['view-all', 'export'],
  employee: ['view-assigned', 'edit-assigned', 'add-comments', 'log-time', 'update-progress'],
  client: ['view-assigned', 'add-comments'],
};

// Task comment permissions by role
export const TASK_COMMENT_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete'],
  admin: ['create', 'read', 'update', 'delete'],
  hr: ['read'],
  employee: ['create', 'read', 'update', 'delete'], // Own comments only
  client: ['create', 'read'], // Own comments only
};

// Check if a role can perform an action on task
export const canPerformTaskAction = (
  role: UserRole,
  action: PermissionAction | string,
  isAssigned: boolean = false,
  isProjectMember: boolean = false,
  isOwnTask: boolean = false
): boolean => {
  // Superadmin can do everything
  if (role === 'superadmin') return true;
  
  // Admin can do everything
  if (role === 'admin') return true;
  
  // HR permissions
  if (role === 'hr') {
    const hrActions = TASK_PERMISSIONS.hr;
    return hrActions.includes(action as PermissionAction) || TASK_ACTION_PERMISSIONS.hr.includes(action);
  }
  
  // Employee permissions
  if (role === 'employee') {
    // For task actions, check if they're assigned to the task or it's in their project
    if ((isAssigned || isProjectMember) && ['read', 'update', 'add-comments', 'log-time', 'update-progress'].includes(action as string)) {
      return true;
    }
    
    // For creating tasks, they need to be project members
    if (action === 'create' && isProjectMember) {
      return true;
    }
    
    const employeeActions = TASK_PERMISSIONS.employee;
    return employeeActions.includes(action as PermissionAction) || TASK_ACTION_PERMISSIONS.employee.includes(action);
  }
  
  // Client permissions (only tasks in their projects)
  if (role === 'client' && isProjectMember) {
    const clientActions = TASK_PERMISSIONS.client;
    return clientActions.includes(action as PermissionAction) || TASK_ACTION_PERMISSIONS.client.includes(action);
  }
  
  return false;
};

// Check if a role can assign tasks
export const canAssignTasks = (role: UserRole): boolean => {
  return ['superadmin', 'admin'].includes(role);
};

// Check if a role can view time logs
export const canViewTimeLogs = (role: UserRole, isAssigned: boolean = false): boolean => {
  if (['superadmin', 'admin'].includes(role)) return true;
  if (role === 'employee' && isAssigned) return true;
  return false;
};