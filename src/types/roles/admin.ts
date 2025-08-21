// Admin specific types
import { IUser } from '../modules/profile';

// Department management
export interface IDepartment {
  id: string;
  name: string;
  description?: string;
  headId?: string; // Department head user ID
  memberIds: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// User management actions for admin
export interface IUserManagementAction {
  userId: string;
  action: 'activate' | 'deactivate' | 'reset_password' | 'change_role' | 'delete';
  reason?: string;
  newRole?: string;
  performedBy: string;
  performedAt: Date;
}

// Bulk operations for admin
export interface IBulkOperation {
  id: string;
  type: 'user_update' | 'project_update' | 'data_export';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  failedItems: number;
  results?: {
    successful: string[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}