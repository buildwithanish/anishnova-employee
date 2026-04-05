const environmentItems = [
  { label: "MongoDB", key: "MONGODB_URI" },
  { label: "JWT Secret", key: "JWT_SECRET" },
  { label: "Admin Email", key: "ADMIN_EMAIL" },
  { label: "Admin Password", key: "ADMIN_PASSWORD" },
  { label: "Public App URL", key: "NEXT_PUBLIC_APP_URL" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Security Settings</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Deployment, security policy, and environment readiness.</h1>
        <p className="mt-3 max-w-3xl text-slate-500">
          Review deployment-critical environment variables before pushing the employee verification platform to Vercel production.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
          <p className="text-sm font-semibold text-slate-950">Environment Variables</p>
          <div className="mt-5 space-y-4">
            {environmentItems.map((item) => {
              const configured = Boolean(process.env[item.key]);

              return (
                <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.key}</p>
                  </div>
                  <span
                    className={
                      configured
                        ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
                        : "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700"
                    }
                  >
                    {configured ? "Configured" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
          <p className="text-sm font-semibold text-slate-950">Vercel Launch Checklist</p>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Add the production domain `employee.anishnova.com` inside the Vercel project settings.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Set `NEXT_PUBLIC_APP_URL=https://employee.anishnova.com` so generated QR codes point to the public portal.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Whitelist Vercel traffic in MongoDB Atlas and store the live connection string in `MONGODB_URI`.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Camera and microphone permissions are enabled for self-hosted face and voice verification workflows.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Rotate admin credentials and JWT secret before the first public deployment.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Redeploy after any environment variable update so the server routes pick up the latest values.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
