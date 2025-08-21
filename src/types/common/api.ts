// src/types/common/api.ts
import { IPagination } from ".";

// API response types
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: IPagination;
  timestamp: Date;
}

export interface IApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: Date;
}

export interface IApiSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
  pagination?: IPagination;
  timestamp: Date;
}