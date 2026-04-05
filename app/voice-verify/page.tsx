import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";
import { VoiceVerifyPanel } from "@/components/voice-verify-panel";

export default function VoiceVerifyPage({
  searchParams,
}: {
  searchParams?: {
    employeeID?: string;
  };
}) {
  return (
    <div className="page-shell">
      <PublicNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="rounded-[34px] bg-slate-950 p-8 text-white shadow-glass">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Voice Identity Workflow</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Voice verification workspace</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Load the employee record, capture a declaration sample, and validate the voice verification workflow against the
            official Anishnova identity phrase.
          </p>
        </div>

        <VoiceVerifyPanel initialEmployeeID={searchParams?.employeeID || ""} />
      </main>
      <Footer />
    </div>
  );
}
