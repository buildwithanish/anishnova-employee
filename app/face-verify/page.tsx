import { FaceVerifyPanel } from "@/components/face-verify-panel";
import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";

export default function FaceVerifyPage({
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Identity Match Lab</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Face verification workflow</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Load an official employee record, upload a comparison face image, and record the verification result in the Anishnova
            Technologies audit log.
          </p>
        </div>

        <FaceVerifyPanel initialEmployeeID={searchParams?.employeeID || ""} />
      </main>
      <Footer />
    </div>
  );
}
