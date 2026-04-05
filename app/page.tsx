import Link from "next/link";
import { ArrowRight, Camera, History, Mic, ShieldCheck, Sparkles } from "lucide-react";

import { Footer } from "@/components/footer";
import { GlassCard } from "@/components/glass-card";
import { PortalSearch } from "@/components/portal-search";
import { PublicNavbar } from "@/components/public-navbar";
import { getVerificationLogs } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export default async function HomePage() {
  const recentLogs = await getVerificationLogs({ limit: 5 });

  return (
    <div className="page-shell">
      <PublicNavbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-10 md:py-14">
        <PortalSearch />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Verification Success Animation",
              description: "Every valid employee lookup opens with a polished verification welcome state.",
              icon: ShieldCheck,
            },
            {
              title: "AI-Assisted Face Review",
              description: "Use the face verification workspace for image-based identity review and logging.",
              icon: Camera,
            },
            {
              title: "Voice Identity Workflow",
              description: "Run browser-based declaration verification with audio capture and audit logs.",
              icon: Mic,
            },
            {
              title: "Recent Trust Signals",
              description: "Track live verification checks, fake attempts, and employee directory activity.",
              icon: History,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.title} className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-950">{item.title}</h2>
                <p className="leading-7 text-slate-600">{item.description}</p>
              </GlassCard>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Verification workflow
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-950">
                One platform for search, verification, QR, face review, and employee trust signals.
              </h2>
              <p className="text-base leading-8 text-slate-600">
                The portal is designed for public employee checks and internal HR operations with secure records,
                search suggestions, QR verification, badge-driven status display, and professional ID generation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                "Scan QR code from employee ID card",
                "Open secure employee verification URL or NFC link",
                "Search by employee name or ID with suggestions",
              ].map((text) => (
                <div key={text} className="rounded-3xl bg-slate-50 p-5 text-sm font-medium text-slate-700">
                  {text}
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-glass">
            <p className="text-sm uppercase tracking-[0.28em] text-blue-200">Quick Access</p>
            <div className="mt-6 space-y-4">
              <Link href="/directory" className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-5 transition hover:bg-white/10">
                <div>
                  <p className="font-semibold">Employee Directory</p>
                  <p className="mt-1 text-sm text-slate-400">Search and browse employees by ID or name</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/qr-scanner" className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-5 transition hover:bg-white/10">
                <div>
                  <p className="font-semibold">QR Scanner</p>
                  <p className="mt-1 text-sm text-slate-400">Open the browser QR verification workspace</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/voice-verify" className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-5 transition hover:bg-white/10">
                <div>
                  <p className="font-semibold">Voice Verify</p>
                  <p className="mt-1 text-sm text-slate-400">Capture a declaration sample and verify voice workflow status</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/deepfake-check" className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-5 transition hover:bg-white/10">
                <div>
                  <p className="font-semibold">Deepfake Screening</p>
                  <p className="mt-1 text-sm text-slate-400">Run synthetic-image risk checks on candidate face images</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/admin" className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-5 transition hover:bg-white/10">
                <div>
                  <p className="font-semibold">Open Admin Panel</p>
                  <p className="mt-1 text-sm text-slate-400">Manage employees and export credentials</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <GlassCard className="space-y-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Platform Highlights</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Glassmorphism public portal",
                "Employee status color system",
                "Auto-generated AN001 style IDs",
                "QR code and NFC-ready links",
                "Voice verification workflow",
                "Deepfake screening audit trail",
                "Professional PNG employee cards",
                "Recent verification activity logging",
              ].map((item) => (
                <div key={item} className="rounded-[24px] bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="space-y-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Recent Verification Log</p>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={String(log._id)} className="flex flex-col gap-2 rounded-[24px] border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{log.employeeID}</p>
                    <p className="mt-1 text-sm text-slate-500">{log.path}</p>
                  </div>
                  <div className="text-sm text-slate-500">
                    {log.source} / {formatDateTime(log.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </main>
      <Footer />
    </div>
  );
}
