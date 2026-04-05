import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  hint,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  hint: string;
  accent?: "blue" | "emerald" | "rose" | "slate" | "amber";
}) {
  const accentStyles = {
    blue: "from-blue-600/15 to-blue-100",
    emerald: "from-emerald-600/15 to-emerald-100",
    rose: "from-rose-600/15 to-rose-100",
    slate: "from-slate-600/10 to-slate-100",
    amber: "from-amber-500/15 to-amber-100",
  }[accent];

  return (
    <div className={cn("rounded-[28px] border border-white/50 bg-gradient-to-br p-6 shadow-glass", accentStyles)}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm text-slate-500">{hint}</p>
    </div>
  );
}
