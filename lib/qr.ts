import QRCode from "qrcode";

import { buildVerificationUrl } from "@/lib/utils";

export function getQrContent(employeeID: string) {
  return buildVerificationUrl(employeeID);
}

export async function generateQrDataUrl(employeeID: string) {
  return QRCode.toDataURL(getQrContent(employeeID), {
    width: 512,
    margin: 1,
    color: {
      dark: "#0F172A",
      light: "#FFFFFFFF",
    },
  });
}

export async function generateQrBuffer(employeeID: string) {
  return QRCode.toBuffer(getQrContent(employeeID), {
    width: 600,
    margin: 1,
    color: {
      dark: "#0F172A",
      light: "#FFFFFFFF",
    },
  });
}
