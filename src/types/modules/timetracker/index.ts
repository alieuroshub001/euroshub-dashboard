import { IBaseDocument, Priority } from '../../common';

// Time tracker status
export type TimeTrackerStatus = 'running' | 'paused' | 'stopped' | 'archived';

// Task category
export type TaskCategory = 'development' | 'design' | 'testing' | 'meeting' | 'documentation' | 'research' | 'support' | 'other';

// Activity level (10-minute intervals)
export interface IActivityLevel {
  timestamp: Date;
  keystrokes: number;
  mouseClicks: number;
  mouseMoves: number;
  scrolls: number;
  activeWindow?: string;
  activeApplication?: string;
  productivityScore: number; // 0-100
  isIdle: boolean;
  intervalMinutes: number;
}

// Screenshot interface
export interface IScreenshot {
  id?: string;
  url: string;
  thumbnailUrl: string;
  blurredUrl?: string;
  publicId: string;
  timestamp: Date;
  intervalStart: Date;
  intervalEnd: Date;
  activityLevel: number;
  keystrokes: number;
  mouseClicks: number;
  activeWindow?: string;
  activeApplication?: string;
  description?: string;
  isManual: boolean;
  isBlurred: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  width?: number;
  height?: number;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task completed during session
export interface ITaskCompleted {
  id?: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  hoursSpent: number;
  projectId?: string;
  taskId?: string;
  tags: string[];
  completedAt: Date;
}

// Device information
export interface IDeviceInfo {
  os?: string;
  browser?: string;
  screen?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  timezone: string;
  ip?: string;
}

// Time tracker session
export interface ITimeTrackerSessionBase {
  employeeId: string;
  projectId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  pausedDuration: number; // minutes
  status: TimeTrackerStatus;
  screenshots: IScreenshot[];
  activityLevels: IActivityLevel[];
  tasksCompleted: ITaskCompleted[];
  totalHours: number;
  productiveHours: number;
  idleHours: number;
  averageActivityLevel: number;
  totalKeystrokes: number;
  totalMouseClicks: number;
  notes?: string;
  lastActive: Date;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  hourlyRate?: number;
  totalEarnings: number;
  deviceInfo: IDeviceInfo;
  isManual: boolean;
}

// Time tracker session document
export interface ITimeTrackerSession extends ITimeTrackerSessionBase, IBaseDocument {}

// Session with details
export interface ITimeTrackerSessionWithDetails extends ITimeTrackerSession {
  employeeDetails: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  projectDetails?: {
    id: string;
    name: string;
    status: string;
  };
  approverDetails?: {
    id: string;
    name: string;
    email: string;
  };
}

// Time tracker settings
export interface ITimeTrackerSettings {
  id?: string;
  employeeId: string;
  screenshotFrequency: number; // minutes
  randomScreenshots: boolean;
  screenshotsPerHour: number;
  isEnabled: boolean;
  blurScreenshots: boolean;
  screenshotsRequired: boolean;
  activityTracking: boolean;
  keyboardTracking: boolean;
  mouseTracking: boolean;
  idleThreshold: number; // minutes
  autoBreakReminder: boolean;
  breakReminderInterval: number; // minutes
  workingHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  notifications: {
    sessionStart: boolean;
    sessionEnd: boolean;
    screenshotTaken: boolean;
    idleDetection: boolean;
    lowActivity: boolean;
  };
  cloudinaryFolder: string;
  createdAt: Date;
  updatedAt: Date;
}

// Work diary (daily summary)
export interface IWorkDiary {
  id?: string;
  employeeId: string;
  date: Date;
  totalSessions: number;
  totalHours: number;
  productiveHours: number;
  idleHours: number;
  screenshotCount: number;
  averageActivityLevel: number;
  tasksCompleted: number;
  totalEarnings: number;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Time tracker filters
export interface ITimeTrackerFilter {
  employeeId?: string[];
  projectId?: string[];
  status?: TimeTrackerStatus[];
  isApproved?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  minHours?: number;
  maxHours?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Time tracker stats
export interface ITimeTrackerStats {
  daily: {
    totalHours: number;
    productiveHours: number;
    idleHours: number;
    totalSessions: number;
    totalScreenshots: number;
    averageActivity: number;
    totalEarnings: number;
  };
  weekly: Array<{
    day: number;
    totalHours: number;
    productiveHours: number;
    totalSessions: number;
    averageActivity: number;
    totalEarnings: number;
  }>;
  monthly: Array<{
    date: number;
    totalHours: number;
    productiveHours: number;
    totalSessions: number;
    totalEarnings: number;
    averageActivity: number;
  }>;
}

// Activity report
export interface IActivityReport {
  employeeId: string;
  sessionId: string;
  date: Date;
  intervals: Array<{
    startTime: Date;
    endTime: Date;
    screenshot?: IScreenshot;
    activityLevel: number;
    keystrokes: number;
    mouseClicks: number;
    activeApplication?: string;
    isIdle: boolean;
  }>;
  summary: {
    totalHours: number;
    productiveHours: number;
    idleHours: number;
    averageActivity: number;
    totalScreenshots: number;
    totalKeystrokes: number;
    totalMouseClicks: number;
  };
}