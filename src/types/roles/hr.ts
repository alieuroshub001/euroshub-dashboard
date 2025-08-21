// HR specific types
import { ILeave } from '../modules/leaves';
import { IAttendance } from '../modules/attendance';

// HR dashboard data
export interface IHRDashboard {
  attendance: {
    todayPresent: number;
    todayAbsent: number;
    todayLate: number;
    monthlyAverage: number;
  };
  leaves: {
    pendingApproval: number;
    thisMonthLeaves: number;
    upcomingLeaves: number;
    leaveBalance: Record<string, number>;
  };
  employees: {
    totalActive: number;
    newJoinees: number;
    birthdays: Array<{
      userId: string;
      name: string;
      date: Date;
    }>;
    workAnniversaries: Array<{
      userId: string;
      name: string;
      years: number;
      date: Date;
    }>;
  };
}

// Employee performance report
export interface IEmployeePerformance {
  employeeId: string;
  period: {
    start: Date;
    end: Date;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateCount: number;
    averageHours: number;
  };
  leaves: {
    totalTaken: number;
    byType: Record<string, number>;
  };
  productivity: {
    tasksCompleted: number;
    projectsWorkedOn: number;
    averageTaskCompletionTime: number;
  };
  timetracker?: {
    totalHours: number;
    productiveHours: number;
    averageActivity: number;
  };
}

// Payroll data (HR access)
export interface IPayrollData {
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  overtime: {
    hours: number;
    rate: number;
    amount: number;
  };
  bonus?: number;
  grossSalary: number;
  netSalary: number;
  tax: number;
  processedBy: string;
  processedAt: Date;
  status: 'draft' | 'processed' | 'paid';
}