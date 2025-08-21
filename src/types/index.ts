// types/index.ts
// Update your types/index.ts
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  emailVerified: boolean;
  verificationToken?: string; // Add this line
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithPassword extends IUser {
  password: string;
}

// Auth session types
export interface ISessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface ISession {
  user: ISessionUser;
  expires: string;
}

// OTP and password reset types
export interface IOTP {
  id: string;
  email: string;
  otp: string;
  type: 'verification' | 'password-reset';
  expiresAt: Date;
  createdAt: Date;
}

export interface IPasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// API response types
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}


// Case management types
export interface IAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface ICase {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  attachments: IAttachment[];
  createdBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard stats
export interface IDashboardStats {
  totalCases: number;
  recentCases: ICase[];
  userActivity?: IUserActivity[];
}

export interface IUserActivity {
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
// // Main types export file
// export * from './common';
// export * from './common/api';
// export * from './common/auth';
// export * from './common/permissions';
// export * from './common/uploads';

// // Module exports
// export * from './modules/profile';
// export * from './modules/projects';
// export * from './modules/tasks';
// export * from './modules/attendance';
// export * from './modules/chats';
// export * from './modules/leaves';
// export * from './modules/timetracker';

// // Role exports
// export * from './roles';
// export * from './roles/superadmin';
// export * from './roles/admin';
// export * from './roles/hr';
// export * from './roles/employee';
// export * from './roles/client';

// // Utility types
// export type ExtractArrayType<T> = T extends (infer U)[] ? U : never;
// export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
// export type DeepPartial<T> = {
//   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
// };

// // Database connection status
// export interface IDatabaseStatus {
//   connected: boolean;
//   readyState: number;
//   host?: string;
//   name?: string;
//   error?: string;
// }

// // Environment configuration
// export interface IEnvironmentConfig {
//   nodeEnv: 'development' | 'production' | 'test';
//   port: number;
//   databaseUrl: string;
//   jwtSecret: string;
//   jwtExpiresIn: string;
//   cloudinaryConfig: {
//     cloudName: string;
//     apiKey: string;
//     apiSecret: string;
//   };
//   emailConfig: {
//     host: string;
//     port: number;
//     secure: boolean;
//     user: string;
//     pass: string;
//   };
// }