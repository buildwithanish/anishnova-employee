"use client";

import { AlertTriangle, CheckCircle2, Loader2, ScanFace, ShieldAlert, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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

type VerificationResult = {
  confidence: number;
  match: boolean;
  notes: string;
};

async function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process one of the images for verification."));
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
    throw new Error("Canvas is not supported in this browser.");
  }

  const dimension = 64;
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

  return vector;
}

function compareVectors(source: number[], target: number[]) {
  let dot = 0;
  let sourceMagnitude = 0;
  let targetMagnitude = 0;
  let diff = 0;

  for (let index = 0; index < source.length; index += 1) {
    dot += source[index] * target[index];
    sourceMagnitude += source[index] * source[index];
    targetMagnitude += target[index] * target[index];
    diff += Math.abs(source[index] - target[index]);
  }

  const cosine = dot / (Math.sqrt(sourceMagnitude) * Math.sqrt(targetMagnitude) || 1);
  const diffScore = 1 - diff / source.length;
  return Math.max(0, Math.min(1, cosine * 0.7 + diffScore * 0.3));
}

export function FaceVerifyPanel() {
  const searchParams = useSearchParams();
  const [employeeID, setEmployeeID] = useState("");
  const [employee, setEmployee] = useState<LookupEmployee | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const canVerify = useMemo(() => Boolean(employee && uploadedPhoto), [employee, uploadedPhoto]);

  useEffect(() => {
    const nextEmployeeID = searchParams.get("employeeID");
    if (nextEmployeeID) {
      setEmployeeID(nextEmployeeID);
    }
  }, [searchParams]);

  const lookupEmployee = async () => {
    const normalized = normalizeEmployeeId(employeeID);
    if (!normalized) {
      setLookupError("Enter a valid employee ID before starting face verification.");
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

  const verifyFace = async () => {
    if (!employee || !uploadedPhoto) {
      return;
    }

    setIsVerifying(true);
    setLookupError("");

    try {
      const referencePhoto = employee.photo
        ? `/api/public/image-proxy?url=${encodeURIComponent(employee.photo)}`
        : "";

      if (!referencePhoto) {
        throw new Error("This employee does not have a stored reference photo for face verification.");
      }

      const [uploadedPixels, referencePixels] = await Promise.all([
        getNormalizedPixels(uploadedPhoto),
        getNormalizedPixels(referencePhoto),
      ]);

      const confidence = Math.round(compareVectors(uploadedPixels, referencePixels) * 100);
      const match = confidence >= 85;
      const notes = match
        ? "Client-side facial similarity check passed above the confidence threshold."
        : "Client-side facial similarity check was below the confidence threshold.";

      await fetch("/api/public/face-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeID: employee.employeeID,
          confidence,
          match,
          notes,
        }),
      });

      setResult({ confidence, match, notes });
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Unable to complete face verification.");
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass rounded-[32px] p-7 shadow-glass">
        <div className="flex items-center gap-3">
          <div className="rounded-3xl bg-slate-950 p-3 text-white">
            <ScanFace className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Face Verification</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Cross-check a live face image with the official employee record</h2>
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
            <label className="text-sm font-medium text-slate-700">Upload face photo</label>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-blue-200 bg-white/70 px-6 py-10 text-center">
              <div className="rounded-3xl bg-blue-50 p-4 text-blue-700">
                <UploadCloud className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-950">Upload a clear front-facing image</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">Use a bright, high-resolution face image for the best similarity confidence result.</p>
              <span className="btn-secondary mt-5">Select Face Photo</span>
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

          <button type="button" onClick={verifyFace} className="btn-primary w-full" disabled={!canVerify || isVerifying}>
            {isVerifying ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Face
              </span>
            ) : (
              "Run Face Verification"
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
              Load an employee record to start the face verification flow.
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass rounded-[32px] p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Uploaded Face</p>
            <div className="mt-5 flex min-h-[260px] items-center justify-center overflow-hidden rounded-[28px] border border-white/60 bg-white/90">
              {uploadedPhoto ? (
                <img src={uploadedPhoto} alt="Uploaded face preview" className="h-full w-full object-cover" />
              ) : (
                <p className="max-w-xs text-center text-sm leading-7 text-slate-500">The uploaded face image preview appears here for comparison.</p>
              )}
            </div>
          </div>

          <div className="glass rounded-[32px] p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Verification Result</p>
            {result ? (
              <div
                className={`mt-5 rounded-[28px] border px-6 py-6 ${
                  result.match ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.match ? <CheckCircle2 className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                  <div>
                    <p className="text-lg font-bold">{result.match ? "Face Verified" : "Identity mismatch detected"}</p>
                    <p className="mt-1 text-sm">{result.notes}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-[22px] bg-white/80 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-current/70">Confidence</p>
                  <p className="mt-2 text-3xl font-black">{result.confidence}%</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                Run verification after loading an employee record and uploading a face photo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
