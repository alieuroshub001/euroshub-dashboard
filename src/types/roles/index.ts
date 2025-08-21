import { UserRole } from '../common';

// Role hierarchy
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 5,
  admin: 4,
  hr: 3,
  employee: 2,
  client: 1,
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  superadmin: 'Full system access and control',
  admin: 'Administrative access with user management',
  hr: 'Human resources management and reporting',
  employee: 'Standard employee access',
  client: 'Limited client access to relevant projects',
};

// Role capabilities
export interface IRoleCapabilities {
  canManageUsers: boolean;
  canManageProjects: boolean;
  canManageTasks: boolean;
  canViewAllAttendance: boolean;
  canManageLeaves: boolean;
  canViewAllChats: boolean;
  canViewAllTimetracker: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
  canDeleteData: boolean;
}

export const ROLE_CAPABILITIES: Record<UserRole, IRoleCapabilities> = {
  superadmin: {
    canManageUsers: true,
    canManageProjects: true,
    canManageTasks: true,
    canViewAllAttendance: true,
    canManageLeaves: true,
    canViewAllChats: true,
    canViewAllTimetracker: true,
    canExportData: true,
    canManageSettings: true,
    canDeleteData: true,
  },
  admin: {
    canManageUsers: true,
    canManageProjects: true,
    canManageTasks: true,
    canViewAllAttendance: true,
    canManageLeaves: true,
    canViewAllChats: false,
    canViewAllTimetracker: true,
    canExportData: true,
    canManageSettings: false,
    canDeleteData: false,
  },
  hr: {
    canManageUsers: false,
    canManageProjects: false,
    canManageTasks: false,
    canViewAllAttendance: true,
    canManageLeaves: true,
    canViewAllChats: false,
    canViewAllTimetracker: true,
    canExportData: true,
    canManageSettings: false,
    canDeleteData: false,
  },
  employee: {
    canManageUsers: false,
    canManageProjects: false,
    canManageTasks: false,
    canViewAllAttendance: false,
    canManageLeaves: false,
    canViewAllChats: false,
    canViewAllTimetracker: false,
    canExportData: false,
    canManageSettings: false,
    canDeleteData: false,
  },
  client: {
    canManageUsers: false,
    canManageProjects: false,
    canManageTasks: false,
    canViewAllAttendance: false,
    canManageLeaves: false,
    canViewAllChats: false,
    canViewAllTimetracker: false,
    canExportData: false,
    canManageSettings: false,
    canDeleteData: false,
  },
};