// src/types/common/index.ts
// Common/shared types across all modules
import { Document } from 'mongoose';

export type UserRole = 'superadmin' | 'admin' | 'hr' | 'employee' | 'client';

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'cancelled';

// Base location interface
export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; 
  address?: string;
}

// Base timestamp interface
export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Base document interface
export interface IBaseDocument extends Document, ITimestamps {
  _id: string;
}

// Pagination interface
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter interface
export interface IBaseFilter {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}