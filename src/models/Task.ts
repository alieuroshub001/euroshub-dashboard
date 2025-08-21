// src/models/Task.ts
import mongoose, { Schema, Model } from 'mongoose';
import { ITask } from '@/types/modules/tasks';
import { AttachmentSchema } from './_shared';

const TaskCommentSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    isEdited: { type: Boolean, default: false }
  },
  { _id: false }
);

const TaskTimeLogSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    hours: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    status: { type: String, enum: ['todo', 'in_progress', 'in_review', 'completed', 'blocked', 'cancelled'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent', 'critical'], required: true },
    assignedTo: { type: String },
    createdBy: { type: String, required: true },
    dueDate: { type: Date },
    completedAt: { type: Date },
    estimatedHours: { type: Number },
    actualHours: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    dependencies: { type: [String] },
    tags: { type: [String] },
    attachments: { type: [AttachmentSchema] },
    isArchived: { type: Boolean, default: false },

    comments: { type: [TaskCommentSchema], default: [] },
    timeLogs: { type: [TaskTimeLogSchema], default: [] }
  },
  { timestamps: true }
);

TaskSchema.index({ projectId: 1, status: 1, priority: 1 });
TaskSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;

