export const COMPANY_NAME = "Anishnova Technologies";
export const COMPANY_TAGLINE = "Innovating the Future of Technology";
export const COMPANY_DOMAIN = "https://employee.anishnova.com";
export const COMPANY_WEBSITE = "https://anishnova.com";
export const COMPANY_CONTACT_EMAIL = "info@anishnova.com";
export const COMPANY_CONTACT_PHONE = "+91 9509868673";
export const COMPANY_ADDRESS = "Anishnova Technologies, Corporate Office, India";
export const ADMIN_COOKIE_NAME = "anishnova_admin_token";
export const DEFAULT_EMPLOYEE_PREFIX = process.env.EMPLOYEE_ID_PREFIX || "AN";

export const EMPLOYEE_STATUSES = ["verified", "pending", "inactive", "suspended"] as const;
export const VERIFICATION_LOG_STATUSES = ["valid", "invalid"] as const;
export const VERIFICATION_LOG_SOURCES = ["link", "qr", "search", "admin", "face", "voice", "deepfake"] as const;

export const DASHBOARD_PAGE_SIZE = 10;
