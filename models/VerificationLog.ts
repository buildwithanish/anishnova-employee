import { model, models, Schema, type Document } from "mongoose";

export interface VerificationLogDocument extends Document {
  employeeID: string;
  matchedEmployeeId?: string;
  matchedEmployeeName?: string;
  status: "valid" | "invalid";
  source: "link" | "qr" | "search" | "admin" | "face" | "voice" | "deepfake";
  path: string;
  confidence?: number;
  notes?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const VerificationLogSchema = new Schema<VerificationLogDocument>(
  {
    employeeID: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    matchedEmployeeId: {
      type: String,
      trim: true,
      default: "",
    },
    matchedEmployeeName: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["valid", "invalid"],
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["link", "qr", "search", "admin", "face", "voice", "deepfake"],
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    confidence: Number,
    notes: String,
    ip: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const VerificationLog =
  models.VerificationLog || model<VerificationLogDocument>("VerificationLog", VerificationLogSchema);

export default VerificationLog;
