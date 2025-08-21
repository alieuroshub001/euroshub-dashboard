// src/types/modules/profile/permission.ts
import { UserRole } from '../../common';
import { PermissionAction } from '../../common/permissions';

// Profile permissions by role
export const PROFILE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'export'],
  hr: ['create', 'read', 'update', 'export'],
  employee: ['read', 'update'], // Own profile only
  client: ['read', 'update'], // Own profile only
};

// Profile field permissions by role
export const PROFILE_FIELD_PERMISSIONS: Record<UserRole, {
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
    canEdit: ['name', 'email', 'phone', 'role', 'employeeId', 'emailVerified', 'isActive', 'bio', 'department', 'position', 'dateOfJoining', 'dateOfBirth', 'address', 'emergencyContact', 'skills', 'certifications', 'socialLinks'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: ['name', 'phone', 'employeeId', 'department', 'position', 'dateOfJoining', 'dateOfBirth', 'address', 'emergencyContact', 'skills', 'certifications'],
    canView: ['name', 'email', 'phone', 'role', 'employeeId', 'department', 'position', 'dateOfJoining', 'dateOfBirth', 'address', 'emergencyContact', 'skills', 'certifications', 'socialLinks'],
    restricted: ['emailVerified', 'isActive'],
  },
  employee: {
    canEdit: ['name', 'phone', 'bio', 'address', 'emergencyContact', 'skills', 'socialLinks'],
    canView: ['name', 'email', 'phone', 'role', 'employeeId', 'profileImage', 'bio', 'department', 'position', 'dateOfJoining', 'dateOfBirth', 'address', 'emergencyContact', 'skills', 'certifications', 'socialLinks'],
    restricted: ['emailVerified', 'isActive', 'dateOfJoining', 'employeeId'],
  },
  client: {
    canEdit: ['name', 'phone', 'address', 'socialLinks'],
    canView: ['name', 'email', 'phone', 'role', 'profileImage', 'address', 'socialLinks'],
    restricted: ['employeeId', 'department', 'position', 'dateOfJoining', 'dateOfBirth', 'emergencyContact', 'skills', 'certifications', 'emailVerified', 'isActive'],
  },
};

// Profile action permissions
export const PROFILE_ACTION_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['create-user', 'view-all', 'edit', 'delete', 'export', 'change-role', 'activate-deactivate'],
  admin: ['create-user', 'view-all', 'edit', 'delete', 'export', 'change-role', 'activate-deactivate'],
  hr: ['view-all', 'edit', 'export'],
  employee: ['view-own', 'edit-own'],
  client: ['view-own', 'edit-own'],
};

// Check if a role can perform an action on profile
export const canPerformProfileAction = (
  role: UserRole,
  action: PermissionAction | string,
  isOwnProfile: boolean = false
): boolean => {
  // Superadmin can do everything
  if (role === 'superadmin') return true;
  
  // Admin can do everything
  if (role === 'admin') return true;
  
  // HR permissions
  if (role === 'hr') {
    const hrActions = PROFILE_PERMISSIONS.hr;
    return hrActions.includes(action as PermissionAction) || PROFILE_ACTION_PERMISSIONS.hr.includes(action);
  }
  
  // Employee permissions (only on own profile)
  if (role === 'employee' && isOwnProfile) {
    const employeeActions = PROFILE_PERMISSIONS.employee;
    return employeeActions.includes(action as PermissionAction) || PROFILE_ACTION_PERMISSIONS.employee.includes(action);
  }
  
  // Client permissions (only on own profile)
  if (role === 'client' && isOwnProfile) {
    const clientActions = PROFILE_PERMISSIONS.client;
    return clientActions.includes(action as PermissionAction) || PROFILE_ACTION_PERMISSIONS.client.includes(action);
  }
  
  return false;
};

// Check if a role can view a specific profile field
export const canViewProfileField = (role: UserRole, field: string, isOwnProfile: boolean = false): boolean => {
  const permissions = PROFILE_FIELD_PERMISSIONS[role];
  
  if (!permissions) return false;
  
  // Check if field is restricted
  if (permissions.restricted.includes('*') || permissions.restricted.includes(field)) {
    return false;
  }
  
  // Check if can view all fields
  if (permissions.canView.includes('*')) {
    return true;
  }
  
  // Check if specific field is allowed
  return permissions.canView.includes(field);
};

// Check if a role can edit a specific profile field
export const canEditProfileField = (role: UserRole, field: string, isOwnProfile: boolean = false): boolean => {
  const permissions = PROFILE_FIELD_PERMISSIONS[role];
  
  if (!permissions) return false;
  
  // Users can only edit their own profile fields (except admins)
  if (!isOwnProfile && role !== 'superadmin' && role !== 'admin' && role !== 'hr') {
    return false;
  }
  
  // Check if field is restricted
  if (permissions.restricted.includes('*') || permissions.restricted.includes(field)) {
    return false;
  }
  
  // Check if can edit all fields
  if (permissions.canEdit.includes('*')) {
    return true;
  }
  
  // Check if specific field is allowed
  return permissions.canEdit.includes(field);
};

// Check if a role can change user roles
export const canChangeUserRole = (role: UserRole, targetRole: UserRole): boolean => {
  if (role === 'superadmin') return true;
  
  if (role === 'admin') {
    // Admin can change roles except to/from superadmin
    return targetRole !== 'superadmin';
  }
  
  return false;
};