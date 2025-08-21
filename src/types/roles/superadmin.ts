// Superadmin specific types
import { IUser } from '../modules/profile';
import { IProject } from '../modules/projects';
import { ITimeTrackerSession } from '../modules/timetracker';

// System settings that only superadmin can manage
export interface ISystemSettings {
  id: string;
  siteName: string;
  siteDescription?: string;
  siteLogo?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  emailSettings: {
    provider: 'smtp' | 'sendgrid' | 'mailgun';
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    from: string;
    fromName: string;
  };
  storageSettings: {
    provider: 'cloudinary' | 'aws-s3' | 'local';
    cloudinaryConfig?: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
    };
  };
  backupSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
  };
  securitySettings: {
    sessionTimeout: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
  };
  createdAt: Date;
  updatedAt: Date;
}

// System analytics that only superadmin can view
export interface ISystemAnalytics {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    newThisMonth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  timetracker: {
    totalHours: number;
    totalEarnings: number;
    activeUsers: number;
    averageHoursPerDay: number;
  };
  storage: {
    totalFiles: number;
    totalSize: number; // bytes
    monthlyUploads: number;
  };
  system: {
    uptime: number; // seconds
    cpuUsage?: number;
    memoryUsage?: number;
    diskUsage?: number;
  };
}

// Audit log for superadmin
export interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}