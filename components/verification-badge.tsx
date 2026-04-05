import { ShieldAlert, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function VerificationBadge({ verified }: { verified: boolean }) {
  const Icon = verified ? ShieldCheck : ShieldAlert;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
        verified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
      )}
    >
      <Icon className="h-4 w-4" />
      {verified ? "Verified Employee" : "Verification Failed"}
    </div>
  );
}
