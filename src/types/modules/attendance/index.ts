import { IBaseDocument, ILocation } from '../../common';

// Attendance status
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'remote' | 'holiday';

// Shift type
export type ShiftType = 'morning' | 'evening' | 'night' | 'flexible';

// Break types
export interface IBreak {
  id?: string;
  type: 'break' | 'lunch' | 'prayer' | 'other';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
}

// Prayer/Namaz tracking
export interface INamaz {
  id?: string;
  type: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
}

// Attendance base interface
export interface IAttendanceBase {
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  checkInLocation?: ILocation;
  checkOutLocation?: ILocation;
  checkInNote?: string;
  checkOutNote?: string;
  status: AttendanceStatus;
  shift: ShiftType;
  breaks: IBreak[];
  namaz: INamaz[];
  totalHours?: number;
  totalBreakMinutes?: number;
  totalNamazMinutes?: number;
  workingHours?: number;
  overtimeHours?: number;
  isRemote: boolean;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

// Attendance document
export interface IAttendance extends IAttendanceBase, IBaseDocument {}

// Attendance with employee details
export interface IAttendanceWithDetails extends IAttendance {
  employeeDetails: {
    id: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
    profileImage?: string;
  };
}

// Attendance summary
export interface IAttendanceSummary {
  employeeId: string;
  month: number;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  remoteDays: number;
  totalHours: number;
  averageHours: number;
  overtimeHours: number;
}

// Attendance filters
export interface IAttendanceFilter {
  employeeId?: string[];
  status?: AttendanceStatus[];
  shift?: ShiftType[];
  dateFrom?: Date;
  dateTo?: Date;
  isRemote?: boolean;
  department?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

// Check-in/out interface
export interface ICheckInOut {
  location?: ILocation;
  notes?: string;
  isRemote?: boolean;
}