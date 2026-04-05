"use client";

import { Building2, LayoutDashboard, Mic, PlusSquare, QrCode, ScanFace, Settings, ShieldAlert, ShieldCheck, Users, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/add-employee", label: "Add Employee", icon: PlusSquare },
  { href: "/directory", label: "Employee Directory", icon: Users },
  { href: "/admin/qr-generator", label: "QR Generator", icon: QrCode },
  { href: "/admin/id-card-generator", label: "ID Card Generator", icon: WalletCards },
  { href: "/admin/face-verification-logs", label: "Face Verification Logs", icon: ScanFace },
  { href: "/admin/voice-verification-logs", label: "Voice Verification Logs", icon: Mic },
  { href: "/admin/deepfake-detection-logs", label: "Deepfake Detection Logs", icon: ShieldAlert },
  { href: "/admin/blockchain-records", label: "Blockchain Records", icon: ShieldCheck },
  { href: "/admin/settings", label: "Security Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-dark flex h-full flex-col rounded-[28px] p-5 text-white">
      <div className="border-b border-white/10 pb-5">
        <BrandLogo href="/admin/dashboard" dark />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-blue-200">Security</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Public verification, fake attempt logging, QR credentials, and employee identity controls.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200",
                active ? "bg-white text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-gradient-to-br from-blue-500 to-emerald-500 p-[1px]">
        <div className="rounded-[calc(1.5rem-1px)] bg-slate-950/90 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Production Ready</p>
              <p className="text-xs text-slate-400">Vercel + MongoDB + JWT secured</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
