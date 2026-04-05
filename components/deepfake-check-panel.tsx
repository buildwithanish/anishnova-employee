"use client";

import { AlertTriangle, Loader2, ShieldAlert, ShieldCheck, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { normalizeEmployeeId } from "@/lib/utils";

type LookupEmployee = {
  employeeID: string;
  fullName: string;
  designation: string;
  department: string;
  photo?: string;
  status: "verified" | "pending" | "inactive" | "suspended";
  officeLocation?: string;
};

type ScanResult = {
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  notes: string;
};

async function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process the uploaded image."));
    image.src = src;
  });
}

function cropSquare(sourceWidth: number, sourceHeight: number) {
  const size = Math.min(sourceWidth, sourceHeight);
  return {
    sx: Math.floor((sourceWidth - size) / 2),
    sy: Math.floor((sourceHeight - size) / 2),
    size,
  };
}

async function getNormalizedPixels(src: string) {
  const image = await loadImageElement(src);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas processing is not supported in this browser.");
  }

  const dimension = 96;
  const crop = cropSquare(image.width, image.height);
  canvas.width = dimension;
  canvas.height = dimension;
  context.drawImage(image, crop.sx, crop.sy, crop.size, crop.size, 0, 0, dimension, dimension);

  const { data } = context.getImageData(0, 0, dimension, dimension);
  const vector = new Array<number>(dimension * dimension);

  for (let index = 0; index < vector.length; index += 1) {
    const offset = index * 4;
    const grayscale = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
    vector[index] = grayscale / 255;
  }

  return {
    dimension,
    vector,
  };
}

function compareVectors(source: number[], target: number[]) {
  let dot = 0;
  let sourceMagnitude = 0;
  let targetMagnitude = 0;

  for (let index = 0; index < source.length; index += 1) {
    dot += source[index] * target[index];
    sourceMagnitude += source[index] * source[index];
    targetMagnitude += target[index] * target[index];
  }

  return Math.max(0, Math.min(1, dot / (Math.sqrt(sourceMagnitude) * Math.sqrt(targetMagnitude) || 1)));
}

function analyzeRisk(input: { dimension: number; vector: number[]; similarity?: number }) {
  const { dimension, vector, similarity = 1 } = input;
  let edgeDiff = 0;
  let symmetryDiff = 0;

  for (let y = 0; y < dimension; y += 1) {
    for (let x = 0; x < dimension; x += 1) {
      const index = y * dimension + x;
      if (x > 0) {
        edgeDiff += Math.abs(vector[index] - vector[index - 1]);
      }

      const mirroredIndex = y * dimension + (dimension - x - 1);
      symmetryDiff += Math.abs(vector[index] - vector[mirroredIndex]);
    }
  }

  const avgEdgeDiff = edgeDiff / vector.length;
  const avgSymmetryDiff = symmetryDiff / vector.length;
  const smoothnessRisk = Math.max(0, Math.min(100, (0.08 - avgEdgeDiff) * 950));
  const symmetryRisk = Math.max(0, Math.min(100, (0.04 - avgSymmetryDiff) * 1800));
  const mismatchRisk = Math.max(0, Math.min(100, (1 - similarity) * 140));
  const riskScore = Math.round(smoothnessRisk * 0.42 + symmetryRisk * 0.18 + mismatchRisk * 0.4);
  const authenticityScore = Math.max(0, 100 - riskScore);
  const riskLevel = riskScore >= 65 ? "high" : riskScore >= 40 ? "medium" : "low";

  return {
    authenticityScore,
    riskLevel,
  } as const;
}

export function DeepfakeCheckPanel({
  initialEmployeeID = "",
}: {
  initialEmployeeID?: string;
}) {
  const [employeeID, setEmployeeID] = useState(initialEmployeeID);
  const [employee, setEmployee] = useState<LookupEmployee | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const canScan = useMemo(() => Boolean(employee && uploadedPhoto), [employee, uploadedPhoto]);

  const lookupEmployee = async () => {
    const normalized = normalizeEmployeeId(employeeID);
    if (!normalized) {
      setLookupError("Enter a valid employee ID before starting AI screening.");
      setEmployee(null);
      setResult(null);
      return;
    }

    setIsLookingUp(true);
    setLookupError("");
    setResult(null);

    try {
      const response = await fetch(`/api/public/lookup?employeeID=${encodeURIComponent(normalized)}`);
      const data = await response.json();

      if (!response.ok || !data.employee) {
        throw new Error(data.message || "Employee record not found.");
      }

      setEmployee(data.employee as LookupEmployee);
      setEmployeeID(normalized);
    } catch (error) {
      setEmployee(null);
      setLookupError(error instanceof Error ? error.message : "Unable to load employee record.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const runScreening = async () => {
    if (!employee || !uploadedPhoto) {
      return;
    }

    setIsScanning(true);
    setLookupError("");

    try {
      const referencePhoto = employee.photo
        ? `/api/public/image-proxy?url=${encodeURIComponent(employee.photo)}`
        : "";
      const uploadedAnalysis = await getNormalizedPixels(uploadedPhoto);
      const referenceAnalysis = referencePhoto ? await getNormalizedPixels(referencePhoto) : null;
      const similarity = referenceAnalysis
        ? compareVectors(uploadedAnalysis.vector, referenceAnalysis.vector)
        : 0.72;
      const scan = analyzeRisk({
        dimension: uploadedAnalysis.dimension,
        vector: uploadedAnalysis.vector,
        similarity,
      });
      const match = scan.riskLevel !== "high";
      const notes =
        scan.riskLevel === "high"
          ? "Possible synthetic or mismatched face characteristics detected."
          : "No high-risk synthetic face signals detected in the uploaded image.";

      await fetch("/api/public/deepfake-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeID: employee.employeeID,
          confidence: scan.authenticityScore,
          match,
          riskLevel: scan.riskLevel,
          notes,
        }),
      });

      setResult({
        confidence: scan.authenticityScore,
        riskLevel: scan.riskLevel,
        notes,
      });
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Unable to complete deepfake screening.");
      setResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass rounded-[32px] p-7 shadow-glass">
        <div className="flex items-center gap-3">
          <div className="rounded-3xl bg-slate-950 p-3 text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Deepfake Detection AI</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Screen face images for synthetic-risk indicators and photo mismatch</h2>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Employee ID</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                value={employeeID}
                onChange={(event) => setEmployeeID(event.target.value)}
                placeholder="Enter Employee ID (Example: AN001)"
                className="input flex-1"
              />
              <button type="button" onClick={lookupEmployee} className="btn-primary min-w-[150px]" disabled={isLookingUp}>
                {isLookingUp ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Load Record"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Upload candidate face image</label>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-blue-200 bg-white/70 px-6 py-10 text-center">
              <div className="rounded-3xl bg-blue-50 p-4 text-blue-700">
                <UploadCloud className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-950">Upload a face image to screen</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">The AI screening workflow checks smoothness artifacts, excessive symmetry, and mismatch against the official record.</p>
              <span className="btn-secondary mt-5">Select Face Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setUploadedPhoto(URL.createObjectURL(file));
                    setResult(null);
                  }
                }}
              />
            </label>
          </div>

          {lookupError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{lookupError}</p>
            </div>
          ) : null}

          <button type="button" onClick={runScreening} className="btn-primary w-full" disabled={!canScan || isScanning}>
            {isScanning ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Screening Image
              </span>
            ) : (
              "Run Deepfake Screening"
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-[32px] p-7 shadow-glass">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Employee Record</p>
          {employee ? (
            <div className="mt-5 rounded-[28px] border border-white/60 bg-white/90 p-5">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-[24px] bg-slate-100">
                  {employee.photo ? (
                    <img src={employee.photo} alt={employee.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-500">
                      {employee.fullName
                        .split(" ")
                        .map((part: string) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{employee.employeeID}</p>
                  <p className="mt-2 text-xl font-bold text-slate-950">{employee.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{employee.designation} / {employee.department}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StatusBadge status={employee.status} />
                {employee.officeLocation ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{employee.officeLocation}</span> : null}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
              Load an employee record to compare the uploaded image against the official profile photo.
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass rounded-[32px] p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Uploaded Image</p>
            <div className="mt-5 flex min-h-[260px] items-center justify-center overflow-hidden rounded-[28px] border border-white/60 bg-white/90">
              {uploadedPhoto ? (
                <img src={uploadedPhoto} alt="Uploaded image preview" className="h-full w-full object-cover" />
              ) : (
                <p className="max-w-xs text-center text-sm leading-7 text-slate-500">The uploaded candidate image preview appears here for analysis.</p>
              )}
            </div>
          </div>

          <div className="glass rounded-[32px] p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Screening Result</p>
            {result ? (
              <div
                className={`mt-5 rounded-[28px] border px-6 py-6 ${
                  result.riskLevel === "high"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : result.riskLevel === "medium"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.riskLevel === "high" ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                  <div>
                    <p className="text-lg font-bold">
                      {result.riskLevel === "high" ? "Possible deepfake detected" : "No critical deepfake risk detected"}
                    </p>
                    <p className="mt-1 text-sm">{result.notes}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-white/80 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-current/70">Authenticity Score</p>
                    <p className="mt-2 text-3xl font-black">{result.confidence}%</p>
                  </div>
                  <div className="rounded-[22px] bg-white/80 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-current/70">Risk Level</p>
                    <p className="mt-2 text-3xl font-black capitalize">{result.riskLevel}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                Upload a candidate image and run the screening workflow to review synthetic-risk indicators.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
