import { IBaseDocument, Priority } from '../../common';
import { IAttachment } from '../../common/uploads';

// Project status
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

// Team member role in project
export type ProjectMemberRole = 'manager' | 'lead' | 'member' | 'viewer';

// Project team member
export interface IProjectMember {
  userId: string;
  role: ProjectMemberRole;
  joinedAt: Date;
  permissions?: string[];
}

// Project base interface
export interface IProjectBase {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours: number;
  budget?: number;
  spentBudget?: number;
  progress: number;
  createdBy: string;
  clientId?: string;
  teamMembers: IProjectMember[];
  tags?: string[];
  attachments?: IAttachment[];
  isArchived: boolean;
}

// Project document
export interface IProject extends IProjectBase, IBaseDocument {}

// Project with additional data
export interface IProjectWithStats extends IProject {
  taskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
  activeTaskCount: number;
  teamMemberCount: number;
  completionPercentage: number;
  isOverdue: boolean;
  daysRemaining?: number;
}

// Project filters
export interface IProjectFilter {
  status?: ProjectStatus[];
  priority?: Priority[];
  clientId?: string[];
  createdBy?: string[];
  teamMember?: string;
  search?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

// Project creation interface
export interface IProjectCreate extends Omit<IProjectBase, 'actualHours' | 'progress' | 'spentBudget' | 'isArchived'> {}

// Project update interface
export interface IProjectUpdate extends Partial<Omit<IProjectBase, 'createdBy'>> {}