import { z } from "zod";

import { EMPLOYEE_STATUSES } from "@/lib/constants";
import { normalizeEmployeeId } from "@/lib/utils";

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6),
});

export const employeeSchema = z.object({
  employeeID: z
    .string()
    .optional()
    .transform((value) => (value ? normalizeEmployeeId(value) : undefined)),
  fullName: z.string().min(2).max(120),
  photo: z.string().optional().default(""),
  designation: z.string().min(2).max(120),
  department: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  officeLocation: z.string().min(2).max(120),
  manager: z.string().min(2).max(120),
  joiningDate: z.string().min(8),
  address: z.string().min(5).max(500),
  bloodGroup: z.string().max(10).optional().default(""),
  emergencyContact: z.string().max(40).optional().default(""),
  status: z.enum(EMPLOYEE_STATUSES).default("verified"),
});

export const employeeUpdateSchema = employeeSchema.partial().extend({
  employeeID: z.string().optional().transform((value) => (value ? normalizeEmployeeId(value) : undefined)),
});

export const publicSearchSchema = z.object({
  q: z.string().min(1).max(100),
});

export const publicLookupSchema = z.object({
  employeeID: z.string().min(2).max(20).transform(normalizeEmployeeId),
});

export const faceVerificationSchema = z.object({
  employeeID: z.string().min(2).max(20).transform(normalizeEmployeeId),
  confidence: z.number().min(0).max(100),
  match: z.boolean(),
  notes: z.string().max(250).optional().default(""),
});

export const voiceVerificationSchema = z.object({
  employeeID: z.string().min(2).max(20).transform(normalizeEmployeeId),
  confidence: z.number().min(0).max(100),
  match: z.boolean(),
  transcript: z.string().max(240).optional().default(""),
  notes: z.string().max(250).optional().default(""),
});

export const deepfakeDetectionSchema = z.object({
  employeeID: z.string().min(2).max(20).transform(normalizeEmployeeId),
  confidence: z.number().min(0).max(100),
  match: z.boolean(),
  riskLevel: z.enum(["low", "medium", "high"]),
  notes: z.string().max(250).optional().default(""),
});
