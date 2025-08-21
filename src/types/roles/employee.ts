// Employee specific types

// Employee dashboard data
export interface IEmployeeDashboard {
  todayAttendance?: {
    checkIn?: Date;
    checkOut?: Date;
    totalHours: number;
    status: string;
  };
  activeTimeTracker?: {
    sessionId: string;
    title: string;
    startTime: Date;
    elapsedTime: number;
    status: string;
  };
  myTasks: {
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  myProjects: {
    active: number;
    completed: number;
  };
  leaveBalance: {
    vacation: number;
    sick: number;
    personal: number;
  };
  upcomingLeaves: Array<{
    id: string;
    type: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
}

// Employee self-service actions
export interface IEmployeeSelfService {
  canUpdateProfile: boolean;
  canViewPayslips: boolean;
  canApplyLeave: boolean;
  canViewAttendance: boolean;
  canUseTimeTracker: boolean;
  canViewTasks: boolean;
  canCommunicate: boolean;
}