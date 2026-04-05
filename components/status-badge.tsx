import { employeeStatusMap, type EmployeeStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  compact = false,
}: {
  status: EmployeeStatus | string;
  compact?: boolean;
}) {
  const normalizedStatus = (status in employeeStatusMap ? status : "unknown") as keyof typeof employeeStatusMap;
  const config = employeeStatusMap[normalizedStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        config.badgeClassName,
      )}
    >
      {compact ? config.shortLabel : config.label}
    </span>
  );
}
