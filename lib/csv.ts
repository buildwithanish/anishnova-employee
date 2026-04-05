import { parse } from "csv-parse/sync";

type CsvRow = Record<string, string>;

function readValue(row: CsvRow, keys: string[]) {
  const lowerCaseMap = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toLowerCase().trim(), value]),
  );

  for (const key of keys) {
    const value = lowerCaseMap[key.toLowerCase()];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function parseEmployeeCsv(csvText: string) {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  return rows.map((row) => ({
    employeeID: readValue(row, ["employeeid", "employee_id", "id"]),
    fullName: readValue(row, ["fullname", "full_name", "name"]),
    designation: readValue(row, ["designation", "title"]),
    department: readValue(row, ["department"]),
    email: readValue(row, ["email"]),
    phone: readValue(row, ["phone", "mobile"]),
    officeLocation: readValue(row, ["officelocation", "office_location", "location"]),
    manager: readValue(row, ["manager", "managername", "manager_name"]),
    joiningDate: readValue(row, ["joiningdate", "joining_date", "doj"]),
    address: readValue(row, ["address"]),
    bloodGroup: readValue(row, ["bloodgroup", "blood_group"]),
    emergencyContact: readValue(row, ["emergencycontact", "emergency_contact"]),
    status: readValue(row, ["status"]) || "active",
    photo: readValue(row, ["photo", "photo_url", "image"]),
  }));
}
