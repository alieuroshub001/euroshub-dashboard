// src/models/_shared.ts
import mongoose, { Schema } from 'mongoose';

export const AttachmentSchema: Schema = new Schema(
  {
    id: { type: String },
    url: { type: String, required: true },
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
    original_filename: { type: String, required: true },
    filename: { type: String, required: true },
    format: { type: String, required: true },
    resource_type: { type: String, enum: ['image', 'video', 'audio', 'raw'], required: true },
    type: { type: String, enum: ['upload'], default: 'upload' },
    bytes: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    folder: { type: String },
    tags: { type: [String], default: [] },
    created_at: { type: Date, required: true },
    uploaded_by: { type: String }
  },
  { _id: false }
);

export const LocationSchema: Schema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      validate: {
        validator: (arr: number[]) => Array.isArray(arr) && arr.length === 2,
        message: 'coordinates must be an array of [longitude, latitude]'
      },
      required: true
    },
    address: { type: String }
  },
  { _id: false }
);

export default mongoose;

