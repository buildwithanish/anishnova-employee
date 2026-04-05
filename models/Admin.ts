import { model, models, Schema, type Document } from "mongoose";

export interface AdminDocument extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: "superadmin";
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<AdminDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Platform Admin",
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin"],
      default: "superadmin",
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  },
);

const Admin = models.Admin || model<AdminDocument>("Admin", AdminSchema);

export default Admin;
