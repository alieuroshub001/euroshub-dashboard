// src/models/Chat.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IChat, IMessage } from '@/types/modules/chats';
import { AttachmentSchema } from './_shared';

const ReactionSchema: Schema = new Schema(
  {
    emoji: { type: String, required: true },
    userIds: { type: [String], default: [] },
    count: { type: Number, default: 0 }
  },
  { _id: false }
);

const ReadBySchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    readAt: { type: Date, required: true }
  },
  { _id: false }
);

const LinkPreviewSchema: Schema = new Schema(
  {
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    image: { type: String },
    domain: { type: String },
    favicon: { type: String }
  },
  { _id: false }
);

const MessageSchema: Schema = new Schema(
  {
    content: { type: String },
    senderId: { type: String, required: true },
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    replyToId: { type: String },
    attachments: { type: [AttachmentSchema], default: [] },
    reactions: { type: [ReactionSchema], default: [] },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    },
    readBy: { type: [ReadBySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: String },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    linkPreview: { type: LinkPreviewSchema },
    mentionedUsers: { type: [String] }
  },
  { timestamps: true }
);

const ChatMemberSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    lastRead: { type: Date },
    isMuted: { type: Boolean, default: false },
    muteUntil: { type: Date },
    notifications: { type: Boolean, default: true }
  },
  { _id: false }
);

const ChatSchema: Schema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    type: { type: String, enum: ['direct', 'group', 'channel'], required: true },
    isPrivate: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
    members: { type: [ChatMemberSchema], default: [] },
    avatar: { type: String },
    topic: { type: String },
    pinnedMessages: { type: [String], default: [] },
    lastMessage: { type: String },
    lastActivity: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
    archivedBy: { type: String },
    archivedAt: { type: Date }
  },
  { timestamps: true }
);

ChatSchema.index({ type: 1, isPrivate: 1 });
ChatSchema.index({ 'members.userId': 1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export { Chat, Message };

