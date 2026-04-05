"use client";

import { Building2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { VerificationEntryModal } from "@/components/verification-entry-modal";
import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/constants";
import { normalizeEmployeeId } from "@/lib/utils";

type SuggestionEmployee = {
  employeeID: string;
  fullName: string;
  designation: string;
  department: string;
  status: string;
};

type LookupState = {
  open: boolean;
  found: boolean;
  employeeID: string;
  employeeName?: string;
};

type PortalFeature = {
  title: string;
  description: string;
  icon: typeof ShieldCheck;
};

export function PortalSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionEmployee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookup, setLookup] = useState<LookupState>({
    open: false,
    found: false,
    employeeID: "",
  });
  const deferredValue = useDeferredValue(value);
  const features: PortalFeature[] = [
    {
      title: "Official Records",
      description: "Search verified employee identity records in seconds.",
      icon: ShieldCheck,
    },
    {
      title: "QR + NFC Ready",
      description: "Verification links support QR experiences and NFC-ready employee cards.",
      icon: Building2,
    },
    {
      title: "Trust Layer",
      description: "View verification status, company details, and recent checks in one portal.",
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    const query = deferredValue.trim();

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(`/api/public/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        setSuggestions(data.results?.slice(0, 5) || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [deferredValue]);

  const runLookup = async (employeeID: string) => {
    const normalizedEmployeeID = normalizeEmployeeId(employeeID);
    if (!normalizedEmployeeID) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/public/lookup?employeeID=${encodeURIComponent(normalizedEmployeeID)}`);
      const data = await response.json();
      if (!response.ok) {
        return;
      }

      setLookup({
        open: true,
        found: Boolean(data.employee),
        employeeID: normalizedEmployeeID,
        employeeName: data.employee?.fullName,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col items-center justify-center px-4">
        <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="glass relative w-full overflow-hidden rounded-[40px] border border-white/60 px-6 py-12 text-center shadow-[0_40px_120px_rgba(30,41,59,0.18)] md:px-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10" />
          <div className="relative mx-auto max-w-3xl space-y-8">
            <div className="mx-auto flex justify-center">
              <BrandLogo compact />
            </div>

            <div className="space-y-4">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <Sparkles className="h-4 w-4" />
                Official identity verification experience
              </div>
              <div>
                <p className="text-base font-semibold uppercase tracking-[0.4em] text-slate-400">
                  {COMPANY_NAME}
                </p>
                <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
                  Employee Verification Portal
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {COMPANY_NAME} Official Verification System
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.28em] text-slate-400">
                  {COMPANY_TAGLINE}
                </p>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void runLookup(value);
              }}
              className="mx-auto max-w-3xl"
            >
              <div className="rounded-[32px] border border-white/70 bg-white/90 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      className="input h-16 rounded-[24px] border-white bg-slate-50/80 pl-14 text-base shadow-none"
                      placeholder="Enter Employee ID (Example: AN001)"
                    />
                  </div>
                  <button type="submit" className="btn-primary h-16 min-w-[220px] rounded-[24px]" disabled={isSearching}>
                    {isSearching ? "Checking..." : "Verify Employee"}
                  </button>
                </div>
              </div>
            </form>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ title, description, icon: ItemIcon }) => {
                return (
                  <div key={title} className="rounded-[28px] border border-white/60 bg-white/70 p-5 text-left shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                  </div>
                );
              })}
            </div>

            {suggestions.length > 0 ? (
              <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-white/60 bg-white/85 p-4 text-left shadow-sm">
                <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Search Suggestions
                </p>
                <div className="space-y-2">
                  {suggestions.map((employee) => (
                    <button
                      key={employee.employeeID}
                      type="button"
                      onClick={() => {
                        setValue(employee.employeeID);
                        void runLookup(employee.employeeID);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">{employee.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {employee.employeeID} / {employee.designation} / {employee.department}
                        </p>
                      </div>
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <VerificationEntryModal
        open={lookup.open}
        verified={lookup.found}
        employeeID={lookup.employeeID}
        employeeName={lookup.employeeName}
        onCloseLabel={lookup.found ? "View Employee Details" : "View Warning Page"}
        secondaryActions={
          lookup.found
            ? [
                {
                  label: "Verify Face",
                  href: `/face-verify?employeeID=${lookup.employeeID}`,
                },
                {
                  label: "Verify Voice",
                  href: `/voice-verify?employeeID=${lookup.employeeID}`,
                },
              ]
            : []
        }
        onClose={() => {
          setLookup((current) => ({ ...current, open: false }));
          router.push(`/verify/${lookup.employeeID}`);
        }}
      />
    </>
  );
}
