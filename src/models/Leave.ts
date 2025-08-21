// src/models/Leave.ts
import mongoose, { Schema, Model } from 'mongoose';
import { ILeave } from '@/types/modules/leaves';
import { AttachmentSchema } from './_shared';

const ContactDuringLeaveSchema: Schema = new Schema(
  {
    phone: { type: String },
    email: { type: String },
    address: { type: String }
  },
  { _id: false }
);

const LeaveSchema: Schema = new Schema(
  {
    employeeId: { type: String, required: true },
    type: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'emergency', 'other'],
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: String, enum: ['full_day', 'half_day', 'hours'], required: true },
    totalDays: { type: Number, required: true },
    totalHours: { type: Number },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired'], default: 'pending' },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
    attachments: { type: [AttachmentSchema], default: [] },
    isEmergency: { type: Boolean, default: false },
    contactDuringLeave: { type: ContactDuringLeaveSchema },
    delegatedTo: { type: String },
    delegationNotes: { type: String }
  },
  { timestamps: true }
);

LeaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });

const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;

