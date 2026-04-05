import { Resvg } from "@resvg/resvg-js";
import { PDFDocument } from "pdf-lib";

import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/constants";
import { generateQrDataUrl } from "@/lib/qr";
import { buildVerificationUrl, xmlEscape } from "@/lib/utils";
import type { EmployeeDocument } from "@/models/Employee";
import { employeeStatusMap } from "@/lib/status";

const SVG_WIDTH = 1012;
const SVG_HEIGHT = 638;
const PDF_WIDTH = 242.65;
const PDF_HEIGHT = 153.0;

async function imageToDataUri(source?: string) {
  if (!source) {
    return "";
  }

  if (source.startsWith("data:")) {
    return source;
  }

  const response = await fetch(source);
  if (!response.ok) {
    return "";
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

function fallbackPhotoSvg(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="280">
      <rect width="240" height="280" rx="36" fill="#E2E8F0"/>
      <text x="120" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="84" font-weight="700" fill="#0F172A">${xmlEscape(initials || "AT")}</text>
    </svg>
  `;
}

export async function generateIdCardSvg(employee: EmployeeDocument) {
  const [photoDataUrl, qrDataUrl] = await Promise.all([
    imageToDataUri(employee.photo || ""),
    generateQrDataUrl(employee.employeeID),
  ]);

  const safeName = xmlEscape(employee.fullName);
  const safeDesignation = xmlEscape(employee.designation);
  const safeId = xmlEscape(employee.employeeID);
  const safeDepartment = xmlEscape(employee.department);
  const safeManager = xmlEscape(employee.manager || "N/A");
  const safeOffice = xmlEscape(employee.officeLocation || "N/A");
  const safeTagline = xmlEscape(COMPANY_TAGLINE);
  const statusLabel = xmlEscape(
    employeeStatusMap[(employee.status in employeeStatusMap ? employee.status : "inactive") as keyof typeof employeeStatusMap].shortLabel,
  );
  const photoMarkup = photoDataUrl
    ? `<image href="${photoDataUrl}" x="62" y="160" width="240" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />`
    : `<image href="data:image/svg+xml;base64,${Buffer.from(fallbackPhotoSvg(employee.fullName)).toString("base64")}" x="62" y="160" width="240" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />`;

  return `
    <svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="40" y1="24" x2="980" y2="620" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0F172A"/>
          <stop offset="0.55" stop-color="#1D4ED8"/>
          <stop offset="1" stop-color="#10B981"/>
        </linearGradient>
        <clipPath id="photoClip">
          <rect x="62" y="160" width="240" height="280" rx="38" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" rx="42" fill="url(#bg)" />
      <rect x="18" y="18" width="976" height="602" rx="28" fill="white" fill-opacity="0.05" stroke="white" stroke-opacity="0.18" stroke-width="2"/>
      <rect x="36" y="36" width="940" height="566" rx="36" fill="white" fill-opacity="0.08"/>
      <rect x="54" y="54" width="256" height="70" rx="24" fill="white" fill-opacity="0.12"/>
      <text x="96" y="97" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="white">AN</text>
      <text x="336" y="104" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="white">${xmlEscape(COMPANY_NAME)}</text>
      <text x="336" y="146" font-family="Arial, sans-serif" font-size="22" font-weight="500" fill="white" fill-opacity="0.78">${safeTagline}</text>
      <rect x="336" y="184" width="306" height="58" rx="18" fill="white" fill-opacity="0.12"/>
      <text x="366" y="223" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#BBF7D0">${statusLabel} / ${safeDepartment}</text>
      <text x="336" y="320" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="white">${safeName}</text>
      <text x="336" y="370" font-family="Arial, sans-serif" font-size="30" font-weight="500" fill="white" fill-opacity="0.86">${safeDesignation}</text>
      <text x="336" y="424" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="#E2E8F0">Employee ID</text>
      <text x="336" y="462" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="white">${safeId}</text>
      <text x="336" y="510" font-family="Arial, sans-serif" font-size="20" font-weight="500" fill="white" fill-opacity="0.82">Manager: ${safeManager}</text>
      <text x="336" y="544" font-family="Arial, sans-serif" font-size="20" font-weight="500" fill="white" fill-opacity="0.82">Office: ${safeOffice}</text>
      <text x="336" y="578" font-family="Arial, sans-serif" font-size="18" font-weight="500" fill="white" fill-opacity="0.7">Verification URL: ${xmlEscape(buildVerificationUrl(employee.employeeID))}</text>
      <rect x="742" y="184" width="204" height="204" rx="32" fill="white"/>
      <image href="${qrDataUrl}" x="766" y="208" width="156" height="156" />
      <text x="744" y="442" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="white">Scan to verify</text>
      <text x="744" y="480" font-family="Arial, sans-serif" font-size="18" font-weight="500" fill="white" fill-opacity="0.76">NFC Ready / employee.anishnova.com</text>
      <rect x="742" y="516" width="204" height="56" rx="18" fill="white" fill-opacity="0.12"/>
      <text x="778" y="552" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="white">${statusLabel.toUpperCase()}</text>
      ${photoMarkup}
      <rect x="62" y="160" width="240" height="280" rx="38" fill="white" fill-opacity="0.06" stroke="white" stroke-opacity="0.16" stroke-width="2"/>
    </svg>
  `;
}

export async function generateIdCardPng(employee: EmployeeDocument) {
  const svg = await generateIdCardSvg(employee);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: SVG_WIDTH,
    },
  });
  return resvg.render().asPng();
}

export async function generateIdCardPdf(employee: EmployeeDocument) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PDF_WIDTH, PDF_HEIGHT]);
  const png = await generateIdCardPng(employee);
  const image = await pdf.embedPng(png);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: PDF_WIDTH,
    height: PDF_HEIGHT,
  });
  return Buffer.from(await pdf.save());
}

export async function generateBulkIdCardsPdf(employees: EmployeeDocument[]) {
  const pdf = await PDFDocument.create();

  for (const employee of employees) {
    const page = pdf.addPage([PDF_WIDTH, PDF_HEIGHT]);
    const png = await generateIdCardPng(employee);
    const image = await pdf.embedPng(png);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: PDF_WIDTH,
      height: PDF_HEIGHT,
    });
  }

  return Buffer.from(await pdf.save());
}
