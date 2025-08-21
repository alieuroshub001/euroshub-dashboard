// src/types/modules/chats/permission.ts
import { UserRole } from '../../common';
import { PermissionAction } from '../../common/permissions';

// Chat permissions by role
export const CHAT_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'export'],
  hr: ['create', 'read', 'update', 'delete'],
  employee: ['create', 'read', 'update', 'delete'], // Own chats and messages
  client: ['create', 'read', 'update', 'delete'], // Limited to project-related chats
};

// Chat type permissions by role
export const CHAT_TYPE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['direct', 'group', 'channel'],
  admin: ['direct', 'group', 'channel'],
  hr: ['direct', 'group'],
  employee: ['direct', 'group'],
  client: ['direct', 'group'], // Only project-related groups
};

// Message permissions by role
export const MESSAGE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['create', 'read', 'update', 'delete', 'export'],
  admin: ['create', 'read', 'update', 'delete', 'export'],
  hr: ['create', 'read', 'update', 'delete'],
  employee: ['create', 'read', 'update', 'delete'], // Own messages
  client: ['create', 'read', 'update', 'delete'], // Project-related messages only
};

// Chat field permissions by role
export const CHAT_FIELD_PERMISSIONS: Record<UserRole, {
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
    canEdit: ['name', 'description', 'type', 'isPrivate', 'members', 'avatar', 'topic', 'pinnedMessages'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: ['name', 'description', 'members', 'avatar', 'topic'],
    canView: ['*'],
    restricted: ['archivedBy', 'archivedAt'],
  },
  employee: {
    canEdit: [], // Cannot edit chat settings, only participate
    canView: ['name', 'description', 'type', 'avatar', 'topic', 'members', 'lastMessage', 'lastActivity'],
    restricted: ['archivedBy', 'archivedAt', 'createdBy'],
  },
  client: {
    canEdit: [], // Cannot edit chat settings
    canView: ['name', 'description', 'type', 'avatar', 'topic', 'lastMessage', 'lastActivity'],
    restricted: ['members', 'archivedBy', 'archivedAt', 'createdBy', 'pinnedMessages'],
  },
};

// Message field permissions by role
export const MESSAGE_FIELD_PERMISSIONS: Record<UserRole, {
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
    canEdit: ['content', 'attachments', 'reactions', 'status'],
    canView: ['*'],
    restricted: [],
  },
  hr: {
    canEdit: ['content', 'attachments', 'reactions'],
    canView: ['*'],
    restricted: ['readBy', 'deletedBy', 'deletedAt'],
  },
  employee: {
    canEdit: ['content', 'attachments', 'reactions'], // Only own messages
    canView: ['content', 'senderId', 'attachments', 'reactions', 'status', 'readBy', 'isEdited'],
    restricted: ['deletedBy', 'deletedAt'],
  },
  client: {
    canEdit: ['content', 'attachments', 'reactions'], // Only in allowed chats
    canView: ['content', 'senderId', 'attachments', 'reactions', 'status'],
    restricted: ['readBy', 'deletedBy', 'deletedAt', 'mentionedUsers'],
  },
};

// Chat action permissions
export const CHAT_ACTION_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['create-chat', 'delete-chat', 'add-members', 'remove-members', 'change-roles', 'pin-messages', 'mute-members', 'archive-chat'],
  admin: ['create-chat', 'delete-chat', 'add-members', 'remove-members', 'change-roles', 'pin-messages', 'mute-members', 'archive-chat'],
  hr: ['create-chat', 'add-members', 'remove-members', 'pin-messages', 'mute-members'],
  employee: ['leave-chat', 'mute-chat'], // Limited actions
  client: ['leave-chat', 'mute-chat'], // Limited actions
};

// Check if a role can perform an action on chat
export const canPerformChatAction = (
  role: UserRole,
  action: PermissionAction | string,
  isOwnMessage: boolean = false,
  isChatMember: boolean = false
): boolean => {
  // Superadmin can do everything
  if (role === 'superadmin') return true;
  
  // Admin can do everything in chats
  if (role === 'admin') return true;
  
  // HR permissions
  if (role === 'hr') {
    const hrActions = CHAT_PERMISSIONS.hr;
    return hrActions.includes(action as PermissionAction) || CHAT_ACTION_PERMISSIONS.hr.includes(action);
  }
  
  // Employee permissions
  if (role === 'employee') {
    // For message actions, check if it's their own message
    if (['update', 'delete'].includes(action as string) && !isOwnMessage) {
      return false;
    }
    
    const employeeActions = CHAT_PERMISSIONS.employee;
    return employeeActions.includes(action as PermissionAction) || 
           CHAT_ACTION_PERMISSIONS.employee.includes(action);
  }
  
  // Client permissions (only in project chats where they're members)
  if (role === 'client' && isChatMember) {
    const clientActions = CHAT_PERMISSIONS.client;
    return clientActions.includes(action as PermissionAction) || 
           CHAT_ACTION_PERMISSIONS.client.includes(action);
  }
  
  return false;
};

// Check if a role can access a specific chat type
export const canAccessChatType = (role: UserRole, chatType: string): boolean => {
  return CHAT_TYPE_PERMISSIONS[role]?.includes(chatType) || false;
};