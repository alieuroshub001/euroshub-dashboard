// src/models/TimeTracker.ts
import mongoose, { Schema, Model } from 'mongoose';
import { ITimeTrackerSession, ITimeTrackerSettings, IWorkDiary } from '@/types/modules/timetracker';

const ActivityLevelSchema: Schema = new Schema(
  {
    timestamp: { type: Date, required: true },
    keystrokes: { type: Number, default: 0 },
    mouseClicks: { type: Number, default: 0 },
    mouseMoves: { type: Number, default: 0 },
    scrolls: { type: Number, default: 0 },
    activeWindow: { type: String },
    activeApplication: { type: String },
    productivityScore: { type: Number, default: 0 },
    isIdle: { type: Boolean, default: false },
    intervalMinutes: { type: Number, default: 10 }
  },
  { _id: false }
);

const ScreenshotSchema: Schema = new Schema(
  {
    id: { type: String },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    blurredUrl: { type: String },
    publicId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    intervalStart: { type: Date, required: true },
    intervalEnd: { type: Date, required: true },
    activityLevel: { type: Number, default: 0 },
    keystrokes: { type: Number, default: 0 },
    mouseClicks: { type: Number, default: 0 },
    activeWindow: { type: String },
    activeApplication: { type: String },
    description: { type: String },
    isManual: { type: Boolean, default: false },
    isBlurred: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    width: { type: Number },
    height: { type: Number },
    fileSize: { type: Number },
  },
  { _id: false, timestamps: true }
);

const TaskCompletedSchema: Schema = new Schema(
  {
    id: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['development', 'design', 'testing', 'meeting', 'documentation', 'research', 'support', 'other'], required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent', 'critical'], required: true },
    hoursSpent: { type: Number, required: true },
    projectId: { type: String },
    taskId: { type: String },
    tags: { type: [String], default: [] },
    completedAt: { type: Date, required: true }
  },
  { _id: false }
);

const DeviceInfoSchema: Schema = new Schema(
  {
    os: { type: String },
    browser: { type: String },
    screen: {
      type: new Schema(
        {
          width: { type: Number, required: true },
          height: { type: Number, required: true }
        },
        { _id: false }
      )
    },
    userAgent: { type: String },
    timezone: { type: String, required: true },
    ip: { type: String }
  },
  { _id: false }
);

const TimeTrackerSessionSchema: Schema = new Schema(
  {
    employeeId: { type: String, required: true },
    projectId: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    pausedDuration: { type: Number, default: 0 },
    status: { type: String, enum: ['running', 'paused', 'stopped', 'archived'], default: 'running' },
    screenshots: { type: [ScreenshotSchema], default: [] },
    activityLevels: { type: [ActivityLevelSchema], default: [] },
    tasksCompleted: { type: [TaskCompletedSchema], default: [] },
    totalHours: { type: Number, default: 0 },
    productiveHours: { type: Number, default: 0 },
    idleHours: { type: Number, default: 0 },
    averageActivityLevel: { type: Number, default: 0 },
    totalKeystrokes: { type: Number, default: 0 },
    totalMouseClicks: { type: Number, default: 0 },
    notes: { type: String },
    lastActive: { type: Date, default: Date.now },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    hourlyRate: { type: Number },
    totalEarnings: { type: Number, default: 0 },
    deviceInfo: { type: DeviceInfoSchema, required: true },
    isManual: { type: Boolean, default: false }
  },
  { timestamps: true }
);

TimeTrackerSessionSchema.index({ employeeId: 1, startTime: 1 });

const TimeTrackerSettingsSchema: Schema = new Schema(
  {
    employeeId: { type: String, required: true, index: true },
    screenshotFrequency: { type: Number, default: 10 },
    randomScreenshots: { type: Boolean, default: false },
    screenshotsPerHour: { type: Number, default: 6 },
    isEnabled: { type: Boolean, default: true },
    blurScreenshots: { type: Boolean, default: false },
    screenshotsRequired: { type: Boolean, default: true },
    activityTracking: { type: Boolean, default: true },
    keyboardTracking: { type: Boolean, default: true },
    mouseTracking: { type: Boolean, default: true },
    idleThreshold: { type: Number, default: 5 },
    autoBreakReminder: { type: Boolean, default: false },
    breakReminderInterval: { type: Number, default: 60 },
    workingHours: {
      type: new Schema(
        { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' } },
        { _id: false }
      )
    },
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    notifications: {
      type: new Schema(
        {
          sessionStart: { type: Boolean, default: true },
          sessionEnd: { type: Boolean, default: true },
          screenshotTaken: { type: Boolean, default: true },
          idleDetection: { type: Boolean, default: true },
          lowActivity: { type: Boolean, default: false }
        },
        { _id: false }
      )
    },
    cloudinaryFolder: { type: String, default: 'timetracker/screenshots' }
  },
  { timestamps: true }
);

TimeTrackerSettingsSchema.index({ employeeId: 1 }, { unique: true });

const WorkDiarySchema: Schema = new Schema(
  {
    employeeId: { type: String, required: true },
    date: { type: Date, required: true },
    totalSessions: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    productiveHours: { type: Number, default: 0 },
    idleHours: { type: Number, default: 0 },
    screenshotCount: { type: Number, default: 0 },
    averageActivityLevel: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    summary: { type: String },
  },
  { timestamps: true }
);

WorkDiarySchema.index({ employeeId: 1, date: 1 }, { unique: true });

const TimeTrackerSession: Model<ITimeTrackerSession> =
  mongoose.models.TimeTrackerSession || mongoose.model<ITimeTrackerSession>('TimeTrackerSession', TimeTrackerSessionSchema);

const TimeTrackerSettings: Model<ITimeTrackerSettings> =
  mongoose.models.TimeTrackerSettings || mongoose.model<ITimeTrackerSettings>('TimeTrackerSettings', TimeTrackerSettingsSchema);

const WorkDiary: Model<IWorkDiary> =
  mongoose.models.WorkDiary || mongoose.model<IWorkDiary>('WorkDiary', WorkDiarySchema);

export { TimeTrackerSession, TimeTrackerSettings, WorkDiary };

