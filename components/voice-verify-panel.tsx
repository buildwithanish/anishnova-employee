"use client";

import { AlertTriangle, CheckCircle2, Loader2, Mic, MicOff, ShieldAlert, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  voiceSignature?: string;
};

type VerificationResult = {
  confidence: number;
  match: boolean;
  notes: string;
  transcriptScore: number;
};

function normalizeSpeech(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function comparePhrase(expected: string, actual: string) {
  const expectedWords = normalizeSpeech(expected).split(" ").filter(Boolean);
  const actualWords = new Set(normalizeSpeech(actual).split(" ").filter(Boolean));

  if (expectedWords.length === 0) {
    return 0;
  }

  const matchedWords = expectedWords.filter((word) => actualWords.has(word)).length;
  const exactBonus = normalizeSpeech(expected) === normalizeSpeech(actual) ? 12 : 0;
  return Math.min(100, Math.round((matchedWords / expectedWords.length) * 100 + exactBonus));
}

async function decodeAudioSample(blob: Blob) {
  const AudioContextClass =
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("This browser does not support audio decoding for voice verification.");
  }

  const context = new AudioContextClass();
  const arrayBuffer = await blob.arrayBuffer();

  try {
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
    const samples = audioBuffer.getChannelData(0);
    return {
      duration: audioBuffer.duration,
      samples,
    };
  } finally {
    await context.close();
  }
}

function buildVoiceSignature(samples: Float32Array) {
  const binCount = 32;
  const segmentLength = Math.max(Math.floor(samples.length / binCount), 1);
  const bins = new Array<number>(binCount).fill(0);

  for (let index = 0; index < binCount; index += 1) {
    let sum = 0;
    let count = 0;

    for (let offset = 0; offset < segmentLength; offset += 1) {
      const sample = samples[index * segmentLength + offset];
      if (sample === undefined) continue;
      sum += Math.abs(sample);
      count += 1;
    }

    bins[index] = count ? sum / count : 0;
  }

  const max = Math.max(...bins, 0.0001);
  return bins.map((value) => Math.round((value / max) * 100)).join("-");
}

function compareVoiceSignatures(reference: string, candidate: string) {
  const referenceBins = reference.split("-").map(Number);
  const candidateBins = candidate.split("-").map(Number);
  const length = Math.min(referenceBins.length, candidateBins.length);

  if (!length) {
    return 0;
  }

  let totalDifference = 0;
  for (let index = 0; index < length; index += 1) {
    totalDifference += Math.abs(referenceBins[index] - candidateBins[index]);
  }

  return Math.max(0, Math.round(100 - totalDifference / length));
}

function calculateAudioQuality(samples: Float32Array, duration: number) {
  if (!samples.length || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  let rms = 0;
  let dynamicRange = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const current = Math.abs(samples[index]);
    rms += current * current;

    if (index > 0) {
      dynamicRange += Math.abs(current - Math.abs(samples[index - 1]));
    }
  }

  rms = Math.sqrt(rms / samples.length);
  dynamicRange = dynamicRange / samples.length;

  const durationScore = Math.min(100, Math.max(0, (duration / 4.5) * 100));
  const signalScore = Math.min(100, Math.max(0, rms * 260));
  const varianceScore = Math.min(100, Math.max(0, dynamicRange * 950));

  return Math.round(durationScore * 0.3 + signalScore * 0.35 + varianceScore * 0.35);
}

export function VoiceVerifyPanel() {
  const searchParams = useSearchParams();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [employeeID, setEmployeeID] = useState("");
  const [employee, setEmployee] = useState<LookupEmployee | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const expectedPhrase = useMemo(
    () =>
      employee
        ? `My name is ${employee.fullName} and I work at Anishnova Technologies.`
        : "My name is [employee name] and I work at Anishnova Technologies.",
    [employee],
  );

  const canVerify = useMemo(() => Boolean(employee && audioBlob && transcript.trim()), [audioBlob, employee, transcript]);

  useEffect(() => {
    const nextEmployeeID = searchParams.get("employeeID");
    if (nextEmployeeID) {
      setEmployeeID(nextEmployeeID);
    }
  }, [searchParams]);

  const lookupEmployee = async () => {
    const normalized = normalizeEmployeeId(employeeID);
    if (!normalized) {
      setLookupError("Enter a valid employee ID before starting voice verification.");
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
      setTranscript(`My name is ${data.employee.fullName} and I work at Anishnova Technologies.`);
    } catch (error) {
      setEmployee(null);
      setLookupError(error instanceof Error ? error.message : "Unable to load employee record.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorderRef.current = recorder;
      streamRef.current = stream;
      setLookupError("");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const nextBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(nextBlob);
        setAudioUrl(URL.createObjectURL(nextBlob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Microphone access is unavailable.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsRecording(false);
  };

  const verifyVoice = async () => {
    if (!employee || !audioBlob) {
      return;
    }

    setIsVerifying(true);
    setLookupError("");

    try {
      const { duration, samples } = await decodeAudioSample(audioBlob);
      const transcriptScore = comparePhrase(expectedPhrase, transcript);
      const audioQuality = calculateAudioQuality(samples, duration);
      const candidateSignature = buildVoiceSignature(samples);
      const voiceSignatureScore = employee.voiceSignature
        ? compareVoiceSignatures(employee.voiceSignature, candidateSignature)
        : Math.min(100, Math.round(audioQuality * 0.65 + transcriptScore * 0.35));
      const confidence = employee.voiceSignature
        ? Math.round(transcriptScore * 0.2 + audioQuality * 0.2 + voiceSignatureScore * 0.6)
        : Math.round(transcriptScore * 0.65 + audioQuality * 0.35);
      const match = confidence >= 85 && transcriptScore >= 88;
      const notes = employee.voiceSignature
        ? "Voice declaration and enrolled voice signature comparison completed."
        : "Voice declaration workflow completed without an enrolled reference signature.";

      await fetch("/api/public/voice-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeID: employee.employeeID,
          confidence,
          match,
          transcript,
          notes,
        }),
      });

      setResult({
        confidence,
        match,
        notes: `${notes} Transcript match score: ${transcriptScore}%.`,
        transcriptScore,
      });
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Unable to complete voice verification.");
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
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Voice Verification</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Validate the employee declaration phrase and audio signature</h2>
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

          <div className="rounded-[28px] border border-blue-100 bg-blue-50 px-5 py-5">
            <p className="text-sm font-semibold text-blue-900">Required declaration</p>
            <p className="mt-2 text-sm leading-7 text-blue-800">{expectedPhrase}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Transcript or spoken declaration text</label>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              className="input mt-2 min-h-[120px]"
              placeholder="Paste the spoken declaration transcript here"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={isRecording ? stopRecording : startRecording} className="btn-secondary gap-2">
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? "Stop Recording" : "Record Voice"}
            </button>

            <label className="btn-secondary cursor-pointer gap-2">
              <UploadCloud className="h-4 w-4" />
              Upload Voice Sample
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setAudioBlob(file);
                    setAudioUrl(URL.createObjectURL(file));
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

          <button type="button" onClick={verifyVoice} className="btn-primary w-full" disabled={!canVerify || isVerifying}>
            {isVerifying ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Voice
              </span>
            ) : (
              "Run Voice Verification"
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
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {employee.voiceSignature ? "Voice Signature Enrolled" : "Reference Signature Pending"}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
              Load an employee record to begin the voice verification workflow.
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass rounded-[32px] p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Voice Sample</p>
            <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-[28px] border border-white/60 bg-white/90 p-6">
              {audioUrl ? (
                <audio controls src={audioUrl} className="w-full" />
              ) : (
                <p className="max-w-xs text-center text-sm leading-7 text-slate-500">Record or upload a voice declaration sample to preview it here.</p>
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
                    <p className="text-lg font-bold">{result.match ? "Voice Identity Verified" : "Voice verification requires review"}</p>
                    <p className="mt-1 text-sm">{result.notes}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-white/80 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-current/70">Confidence</p>
                    <p className="mt-2 text-3xl font-black">{result.confidence}%</p>
                  </div>
                  <div className="rounded-[22px] bg-white/80 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-current/70">Transcript Match</p>
                    <p className="mt-2 text-3xl font-black">{result.transcriptScore}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                Load an employee record, capture a voice sample, and run the declaration workflow.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
