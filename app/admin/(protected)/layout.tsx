import { LogOut } from "lucide-react";

import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="dashboard-shell min-h-screen p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1700px] gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/50 bg-white/80 p-5 shadow-glass md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Authenticated Session</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">{session.name}</h1>
              <p className="text-sm text-slate-500">{session.email}</p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-secondary gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
          <div className="lg:hidden">
            <AdminSidebar />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
