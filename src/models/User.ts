import mongoose, { Schema, Model, ValidatorProps } from 'mongoose';
import { IUserWithPassword } from '@/types/modules/profile';

const AddressSchema: Schema = new Schema(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String }
  },
  { _id: false }
);

const EmergencyContactSchema: Schema = new Schema(
  {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  { _id: false }
);

const CertificationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    certificateUrl: { type: String }
  },
  { _id: false }
);

const SocialLinksSchema: Schema = new Schema(
  {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String },
    portfolio: { type: String }
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /\S+@\S+\.\S+/.test(v),
        message: (props: ValidatorProps) => `${props.value} is not a valid email!`
      }
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'hr', 'employee', 'client'],
      default: 'employee'
    },
    phone: { type: String },
    profileImage: { type: String },
    employeeId: { type: String },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String },

    // Extended profile fields
    bio: { type: String },
    department: { type: String },
    position: { type: String },
    dateOfJoining: { type: Date },
    dateOfBirth: { type: Date },
    address: { type: AddressSchema },
    emergencyContact: { type: EmergencyContactSchema },
    skills: { type: [String], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    socialLinks: { type: SocialLinksSchema },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

const User: Model<IUserWithPassword> =
  mongoose.models.User || mongoose.model<IUserWithPassword>('User', UserSchema);

export default User;
