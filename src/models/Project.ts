// src/models/Project.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '@/types/modules/projects';
import { AttachmentSchema } from './_shared';

const ProjectMemberSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ['manager', 'lead', 'member', 'viewer'], required: true },
    joinedAt: { type: Date, default: Date.now },
    permissions: { type: [String], default: [] }
  },
  { _id: false }
);

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'], default: 'planning' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent', 'critical'], required: true },
    startDate: { type: Date },
    dueDate: { type: Date },
    estimatedHours: { type: Number },
    actualHours: { type: Number, default: 0 },
    budget: { type: Number },
    spentBudget: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    clientId: { type: String },
    teamMembers: { type: [ProjectMemberSchema], default: [] },
    tags: { type: [String] },
    attachments: { type: [AttachmentSchema] },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1, priority: 1, isArchived: 1 });
ProjectSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;

