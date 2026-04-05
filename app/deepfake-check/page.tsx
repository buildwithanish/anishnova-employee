import { DeepfakeCheckPanel } from "@/components/deepfake-check-panel";
import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";

export default function DeepfakeCheckPage({
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Deepfake Detection AI</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Synthetic face screening workspace</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Upload a candidate face image to screen for mismatch, oversmoothing, and synthetic-risk signals before treating it as
            an official employee identity proof.
          </p>
        </div>

        <DeepfakeCheckPanel initialEmployeeID={searchParams?.employeeID || ""} />
      </main>
      <Footer />
    </div>
  );
}
