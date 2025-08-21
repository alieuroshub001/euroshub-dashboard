// src/types/modules/projects/permission.ts
import { UserRole } from '../../common';
import { PermissionAction } from '../../common/permissions';

// Project permissions by role
export const PROJECT_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  hr: ['read', 'export'],
  employee: ['read'], // Own projects only
  client: ['read'], // Only assigned projects
};

// Project field permissions by role
export const PROJECT_FIELD_PERMISSIONS: Record<UserRole, {
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
    canEdit: ['name', 'description', 'status', 'priority', 'startDate', 'dueDate', 'estimatedHours', 'budget', 'teamMembers', 'tags', 'attachments'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: [],
    canView: ['name', 'description', 'status', 'priority', 'startDate', 'dueDate', 'progress', 'teamMembers', 'tags'],
    restricted: ['budget', 'spentBudget', 'estimatedHours', 'actualHours'],
  },
  employee: {
    canEdit: [],
    canView: ['name', 'description', 'status', 'priority', 'startDate', 'dueDate', 'progress', 'teamMembers', 'tags'],
    restricted: ['budget', 'spentBudget', 'estimatedHours', 'actualHours', 'clientId'],
  },
  client: {
    canEdit: [],
    canView: ['name', 'description', 'status', 'priority', 'startDate', 'dueDate', 'progress', 'tags'],
    restricted: ['budget', 'spentBudget', 'estimatedHours', 'actualHours', 'teamMembers', 'clientId', 'createdBy'],
  },
};

// Project action permissions
export const PROJECT_ACTION_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['create', 'view-all', 'edit', 'delete', 'archive', 'restore', 'export', 'manage-members', 'view-budget'],
  admin: ['create', 'view-all', 'edit', 'delete', 'archive', 'restore', 'export', 'manage-members', 'view-budget'],
  hr: ['view-all', 'export'],
  employee: ['view-assigned'],
  client: ['view-assigned'],
};

// Project member permissions by role
export const PROJECT_MEMBER_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete'],
  admin: ['create', 'read', 'update', 'delete'],
  hr: ['read'],
  employee: ['read'], // Only see team members
  client: ['read'], // Only see team members (limited info)
};

// Check if a role can perform an action on project
export const canPerformProjectAction = (
  role: UserRole,
  action: PermissionAction | string,
  isProjectMember: boolean = false,
  isProjectManager: boolean = false
): boolean => {
  // Superadmin can do everything
  if (role === 'superadmin') return true;
  
  // Admin can do everything
  if (role === 'admin') return true;
  
  // HR permissions
  if (role === 'hr') {
    const hrActions = PROJECT_PERMISSIONS.hr;
    return hrActions.includes(action as PermissionAction) || PROJECT_ACTION_PERMISSIONS.hr.includes(action);
  }
  
  // Employee permissions (only on assigned projects)
  if (role === 'employee' && isProjectMember) {
    const employeeActions = PROJECT_PERMISSIONS.employee;
    return employeeActions.includes(action as PermissionAction) || PROJECT_ACTION_PERMISSIONS.employee.includes(action);
  }
  
  // Client permissions (only on assigned projects)
  if (role === 'client' && isProjectMember) {
    const clientActions = PROJECT_PERMISSIONS.client;
    return clientActions.includes(action as PermissionAction) || PROJECT_ACTION_PERMISSIONS.client.includes(action);
  }
  
  return false;
};

// Check if a role can view project budget
export const canViewProjectBudget = (role: UserRole): boolean => {
  return ['superadmin', 'admin'].includes(role);
};

// Check if a role can manage project members
export const canManageProjectMembers = (role: UserRole): boolean => {
  return ['superadmin', 'admin'].includes(role);
};