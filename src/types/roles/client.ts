// Client specific types

// Client dashboard data
export interface IClientDashboard {
  myProjects: {
    active: number;
    completed: number;
    onHold: number;
    totalBudget: number;
    spentBudget: number;
  };
  recentActivity: Array<{
    type: 'project_update' | 'task_completed' | 'milestone_reached';
    projectId: string;
    projectName: string;
    description: string;
    date: Date;
  }>;
  upcomingDeadlines: Array<{
    projectId: string;
    projectName: string;
    dueDate: Date;
    status: string;
  }>;
}

// Client project access
export interface IClientProjectAccess {
  projectId: string;
  permissions: {
    canViewTasks: boolean;
    canCommentOnTasks: boolean;
    canViewTimeTracking: boolean;
    canViewReports: boolean;
    canUploadFiles: boolean;
    canCommunicate: boolean;
  };
  restrictedData: {
    hideEmployeeRates: boolean;
    hideCosts: boolean;
    hideInternalNotes: boolean;
  };
}

// Client communication preferences
export interface IClientCommunication {
  emailNotifications: {
    projectUpdates: boolean;
    taskCompletion: boolean;
    milestoneReached: boolean;
    weeklyReports: boolean;
    invoiceGenerated: boolean;
  };
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  preferredCommunicationMethod: 'email' | 'chat' | 'both';
}