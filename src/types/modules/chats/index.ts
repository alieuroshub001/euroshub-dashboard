import { IBaseDocument } from '../../common';
import { IAttachment } from '../../common/uploads';

// Message status
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// Chat types
export type ChatType = 'direct' | 'group' | 'channel';

// Message reaction
export interface IReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

// Link preview metadata
export interface ILinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  favicon?: string;
}

// Message base interface
export interface IMessageBase {
  content?: string;
  senderId: string;
  chatId: string;
  replyToId?: string;
  attachments: IAttachment[];
  reactions: IReaction[];
  status: MessageStatus;
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  isEdited: boolean;
  editedAt?: Date;
  linkPreview?: ILinkPreview;
  mentionedUsers?: string[];
}

// Message document
export interface IMessage extends IMessageBase, IBaseDocument {}

// Message with sender details
export interface IMessageWithDetails extends IMessage {
  senderDetails: {
    id: string;
    name: string;
    profileImage?: string;
  };
  replyToMessage?: {
    id: string;
    content?: string;
    senderName: string;
    attachments?: IAttachment[];
  };
}

// Chat member
export interface IChatMember {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastRead?: Date;
  isMuted: boolean;
  muteUntil?: Date;
  notifications: boolean;
}

// Chat base interface
export interface IChatBase {
  name?: string;
  description?: string;
  type: ChatType;
  isPrivate: boolean;
  createdBy: string;
  members: IChatMember[];
  avatar?: string;
  topic?: string;
  pinnedMessages: string[];
  lastMessage?: string;
  lastActivity: Date;
  isArchived: boolean;
  archivedBy?: string;
  archivedAt?: Date;
}

// Chat document
export interface IChat extends IChatBase, IBaseDocument {}

// Chat with additional details
export interface IChatWithDetails extends IChat {
  memberDetails: Array<{
    userId: string;
    name: string;
    email: string;
    profileImage?: string;
    role: 'admin' | 'member' | 'viewer';
    isOnline?: boolean;
    lastSeen?: Date;
  }>;
  lastMessageDetails?: IMessage;
  unreadCount: number;
}

// Typing indicator
export interface ITypingIndicator {
  userId: string;
  chatId: string;
  isTyping: boolean;
  lastTyped: Date;
}

// Chat filters
export interface IChatFilter {
  type?: ChatType[];
  memberId?: string;
  isArchived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Message filters
export interface IMessageFilter {
  chatId: string;
  senderId?: string[];
  hasAttachments?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}