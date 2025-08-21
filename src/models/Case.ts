// models/Case.ts
import mongoose, { Schema, Model } from 'mongoose';
import { ICase } from '@/types';

const AttachmentSchema: Schema = new Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true }
});

const CaseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  attachments: { type: [AttachmentSchema], default: [] },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Case: Model<ICase> = 
  mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);

export default Case;