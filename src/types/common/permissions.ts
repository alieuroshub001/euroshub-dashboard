// src/types/common/permissions.ts
import { UserRole } from './index';

// Permission types
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';

export type ModuleName = 'profile' | 'projects' | 'tasks' | 'attendance' | 'chats' | 'leaves' | 'timetracker';

export interface IPermission {
  module: ModuleName;
  action: PermissionAction;
  own?: boolean; // Can only perform action on own resources
  team?: boolean; // Can perform action on team resources
  all?: boolean; // Can perform action on all resources
}

export interface IRolePermissions {
  role: UserRole;
  permissions: IPermission[];
}

// Permission check function type
export type PermissionChecker = (
  userRole: UserRole,
  module: ModuleName,
  action: PermissionAction,
  resourceOwnerId?: string,
  userId?: string
) => boolean;