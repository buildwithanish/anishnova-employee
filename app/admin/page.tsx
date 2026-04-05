import { ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/forms/login-form";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  return (
    <main className="dark-dashboard min-h-screen px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between rounded-[36px] border border-white/10 bg-white/5 p-8 text-white shadow-glass backdrop-blur-xl">
          <div>
            <BrandLogo dark />
            <div className="mt-16 max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100">
                <ShieldCheck className="h-4 w-4" />
                Secure workforce administration
              </div>
              <h1 className="text-5xl font-black tracking-tight">Admin control for employee identity, verification, and access records.</h1>
              <p className="text-lg leading-8 text-slate-300">
                Manage the entire employee verification platform with secure JWT login, employee lifecycle tools, QR code exports,
                ID card generation, and verification analytics.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {["Employee CRUD", "CSV Bulk Import", "Fake Attempt Logs"].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="glass-dark w-full max-w-lg rounded-[36px] p-8 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-blue-200">Admin Login</p>
            <h2 className="mt-4 text-3xl font-bold">Access the verification command center</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Sign in with your admin email and password to access the secure dashboard.
            </p>
            <div className="mt-8">
              <LoginForm redirectTo={searchParams?.redirect} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
