import Link from "next/link";

import { COMPANY_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href = "/",
  dark = false,
  compact = false,
}: {
  href?: string;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-blue-700 to-emerald-500 text-sm font-black tracking-[0.35em] text-white shadow-glow",
          dark && "shadow-none",
        )}
      >
        AN
      </div>
      {!compact ? (
        <div className="space-y-0.5">
          <p className={cn("text-sm font-semibold tracking-wide", dark ? "text-white" : "text-slate-950")}>
            {COMPANY_NAME}
          </p>
          <p className={cn("text-xs", dark ? "text-slate-300" : "text-slate-500")}>
            Employee Verification Platform
          </p>
        </div>
      ) : null}
    </Link>
  );
}
