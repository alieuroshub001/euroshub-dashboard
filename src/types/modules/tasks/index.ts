import { IBaseDocument, Priority } from '../../common';
import { IAttachment } from '../../common/uploads';

// Task status
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled';

// Task comment
export interface ITaskComment {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
  isEdited: boolean;
}

// Task time log
export interface ITaskTimeLog {
  id: string;
  userId: string;
  hours: number;
  description?: string;
  date: Date;
  createdAt: Date;
}

// Task base interface
export interface ITaskBase {
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: string;
  createdBy: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  dependencies?: string[]; // Task IDs
  tags?: string[];
  attachments?: IAttachment[];
  isArchived: boolean;
}

// Task document
export interface ITask extends ITaskBase, IBaseDocument {
  comments: ITaskComment[];
  timeLogs: ITaskTimeLog[];
}

// Task with additional data
export interface ITaskWithDetails extends ITask {
  assignedToDetails?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  createdByDetails?: {
    id: string;
    name: string;
    email: string;
  };
  projectDetails?: {
    id: string;
    name: string;
    status: string;
  };
  isOverdue: boolean;
  daysRemaining?: number;
  completionPercentage: number;
}

// Task filters
export interface ITaskFilter {
  projectId?: string[];
  status?: TaskStatus[];
  priority?: Priority[];
  assignedTo?: string[];
  createdBy?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

// Task creation interface
export interface ITaskCreate extends Omit<ITaskBase, 'actualHours' | 'progress' | 'isArchived'> {}

// Task update interface
export interface ITaskUpdate extends Partial<Omit<ITaskBase, 'createdBy' | 'projectId'>> {}