import { model, models, Schema, type Document } from "mongoose";

export interface EmployeeDocument extends Document {
  employeeID: string;
  fullName: string;
  photo?: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: Date;
  officeLocation: string;
  manager: string;
  address: string;
  bloodGroup?: string;
  emergencyContact?: string;
  qrCode: string;
  blockchainHash: string;
  nfcTagUrl: string;
  faceEncoding?: number[];
  voiceSignature?: string;
  status: "verified" | "pending" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    employeeID: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    photo: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    officeLocation: {
      type: String,
      required: true,
      trim: true,
    },
    manager: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: "",
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },
    qrCode: {
      type: String,
      required: true,
      trim: true,
    },
    blockchainHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    nfcTagUrl: {
      type: String,
      required: true,
      trim: true,
    },
    faceEncoding: {
      type: [Number],
      default: [],
    },
    voiceSignature: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["verified", "pending", "inactive", "suspended"],
      default: "verified",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

EmployeeSchema.index({
  fullName: "text",
  employeeID: "text",
  designation: "text",
  department: "text",
  manager: "text",
  officeLocation: "text",
});

const Employee = models.Employee || model<EmployeeDocument>("Employee", EmployeeSchema);

export default Employee;
