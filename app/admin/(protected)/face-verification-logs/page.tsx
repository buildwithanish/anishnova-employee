import { getVerificationLogs } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export default async function FaceVerificationLogsPage() {
  const logs = await getVerificationLogs({ source: "face", limit: 50 });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Face Verification Logs</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Review biometric verification attempts.</h1>
        <p className="mt-3 max-w-3xl text-slate-500">
          Every face verification attempt is recorded with source, confidence, matched employee data, and timestamp for audit review.
        </p>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="rounded-[28px] border border-white/60 bg-white/90 px-6 py-12 text-center text-slate-500 shadow-glass">
            No face verification logs yet.
          </div>
        ) : (
          logs.map((log) => (
            <div key={String(log._id)} className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{log.employeeID}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{log.matchedEmployeeName || "Unknown employee record"}</p>
                  <p className="mt-2 text-sm text-slate-500">{log.path}</p>
                </div>
                <span
                  className={
                    log.status === "valid"
                      ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
                      : "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700"
                  }
                >
                  {log.status === "valid" ? "Face Verified" : "Mismatch"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Confidence</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{log.confidence ?? 0}%</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Source</p>
                  <p className="mt-2 font-medium text-slate-900">{log.source}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Recorded At</p>
                  <p className="mt-2 font-medium text-slate-900">{formatDateTime(log.createdAt)}</p>
                </div>
              </div>

              {log.notes ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Notes</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{log.notes}</p>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
