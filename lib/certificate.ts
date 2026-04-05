import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import {
  COMPANY_ADDRESS,
  COMPANY_CONTACT_EMAIL,
  COMPANY_CONTACT_PHONE,
  COMPANY_NAME,
  COMPANY_TAGLINE,
  COMPANY_WEBSITE,
} from "@/lib/constants";
import { buildVerificationUrl, formatDate } from "@/lib/utils";
import type { EmployeeDocument } from "@/models/Employee";

export async function generateEmployeeCertificatePdf(employee: EmployeeDocument) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 24,
    y: 24,
    width: 794,
    height: 547,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.11, 0.29, 0.84),
    borderWidth: 1.5,
  });

  page.drawRectangle({
    x: 42,
    y: 432,
    width: 758,
    height: 110,
    color: rgb(0.07, 0.11, 0.18),
  });

  page.drawText(COMPANY_NAME, {
    x: 62,
    y: 492,
    size: 28,
    font: bold,
    color: rgb(1, 1, 1),
  });

  page.drawText(COMPANY_TAGLINE, {
    x: 62,
    y: 466,
    size: 13,
    font: regular,
    color: rgb(0.78, 0.86, 1),
  });

  page.drawText("Digital Employee Verification Certificate", {
    x: 62,
    y: 378,
    size: 26,
    font: bold,
    color: rgb(0.07, 0.11, 0.18),
  });

  page.drawText(
    "This document certifies that the individual listed is a verified employee identity record of Anishnova Technologies.",
    {
      x: 62,
      y: 346,
      size: 13,
      font: regular,
      color: rgb(0.29, 0.33, 0.41),
      maxWidth: 680,
    },
  );

  const details = [
    ["Employee Name", employee.fullName],
    ["Employee ID", employee.employeeID],
    ["Designation", employee.designation],
    ["Department", employee.department],
    ["Manager", employee.manager],
    ["Office Location", employee.officeLocation],
    ["Verification Date", formatDate(new Date())],
    ["Joining Date", formatDate(employee.joiningDate)],
    ["Blockchain Hash", employee.blockchainHash || "Verification hash pending"],
    ["Verification URL", buildVerificationUrl(employee.employeeID)],
  ] as const;

  let y = 300;
  for (const [label, value] of details) {
    page.drawText(label, {
      x: 62,
      y,
      size: 11,
      font: bold,
      color: rgb(0.18, 0.24, 0.35),
    });
    page.drawText(String(value), {
      x: 220,
      y,
      size: 11,
      font: regular,
      color: rgb(0.2, 0.24, 0.32),
      maxWidth: 520,
    });
    y -= 24;
  }

  page.drawRectangle({
    x: 606,
    y: 66,
    width: 140,
    height: 74,
    color: rgb(0.93, 0.97, 1),
    borderColor: rgb(0.11, 0.29, 0.84),
    borderWidth: 1,
  });

  page.drawText("Company Seal", {
    x: 640,
    y: 112,
    size: 14,
    font: bold,
    color: rgb(0.07, 0.11, 0.18),
  });

  page.drawText("Verified", {
    x: 652,
    y: 88,
    size: 18,
    font: bold,
    color: rgb(0.06, 0.64, 0.45),
  });

  page.drawText(`${COMPANY_WEBSITE}  |  ${COMPANY_CONTACT_EMAIL}  |  ${COMPANY_CONTACT_PHONE}`, {
    x: 62,
    y: 74,
    size: 10,
    font: regular,
    color: rgb(0.29, 0.33, 0.41),
    maxWidth: 500,
  });

  page.drawText(COMPANY_ADDRESS, {
    x: 62,
    y: 56,
    size: 10,
    font: regular,
    color: rgb(0.29, 0.33, 0.41),
    maxWidth: 520,
  });

  return Buffer.from(await pdf.save());
}
