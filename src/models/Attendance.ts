// src/models/Attendance.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IAttendance } from '@/types/modules/attendance';
import { LocationSchema } from './_shared';

const BreakSchema: Schema = new Schema(
  {
    id: { type: String },
    type: { type: String, enum: ['break', 'lunch', 'prayer', 'other'], required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    notes: { type: String }
  },
  { _id: false }
);

const NamazSchema: Schema = new Schema(
  {
    id: { type: String },
    type: { type: String, enum: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }
  },
  { _id: false }
);

const AttendanceSchema: Schema = new Schema(
  {
    employeeId: { type: String, required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    checkInLocation: { type: LocationSchema },
    checkOutLocation: { type: LocationSchema },
    checkInNote: { type: String },
    checkOutNote: { type: String },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'on_leave', 'remote', 'holiday'],
      required: true
    },
    shift: { type: String, enum: ['morning', 'evening', 'night', 'flexible'], required: true },
    breaks: { type: [BreakSchema], default: [] },
    namaz: { type: [NamazSchema], default: [] },
    totalHours: { type: Number },
    totalBreakMinutes: { type: Number },
    totalNamazMinutes: { type: Number },
    workingHours: { type: Number },
    overtimeHours: { type: Number },
    isRemote: { type: Boolean, default: false },
    notes: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;

