import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { COMPANY_DOMAIN } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeEmployeeId(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "N/A";
  return format(new Date(value), "dd MMM yyyy");
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) return "N/A";
  return format(new Date(value), "dd MMM yyyy, hh:mm a");
}

export function buildVerificationUrl(employeeID: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || COMPANY_DOMAIN;
  return `${base.replace(/\/$/, "")}/verify/${normalizeEmployeeId(employeeID)}`;
}

export function slugifyText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function truncate(value: string, length = 32) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 3)}...`;
}

export function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
