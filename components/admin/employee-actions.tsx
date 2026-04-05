"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function EmployeeActions({
  employeeID,
  status,
}: {
  employeeID: string;
  status: "verified" | "pending" | "inactive" | "suspended";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatus = status === "verified" ? "suspended" : "verified";
  const statusLabel = status === "verified" ? "Suspend" : "Mark Verified";

  const toggleStatus = () => {
    startTransition(() => {
      void (async () => {
        await fetch(`/api/employees/${employeeID}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        });

        router.refresh();
      })();
    });
  };

  const remove = () => {
    const confirmed = window.confirm(`Delete employee ${employeeID}?`);
    if (!confirmed) return;

    startTransition(() => {
      void (async () => {
        await fetch(`/api/employees/${employeeID}`, {
          method: "DELETE",
        });

        router.refresh();
      })();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/employees/${employeeID}`} className="btn-secondary px-4 py-2 text-xs">
        View
      </Link>
      <Link href={`/admin/edit-employee/${employeeID}`} className="btn-secondary px-4 py-2 text-xs">
        Edit
      </Link>
      <Link href={`/verify/${employeeID}`} target="_blank" className="btn-secondary px-4 py-2 text-xs">
        Verify
      </Link>
      <button type="button" onClick={toggleStatus} className="btn-primary px-4 py-2 text-xs" disabled={isPending}>
        {statusLabel}
      </button>
      <button type="button" onClick={remove} className="btn-danger px-4 py-2 text-xs" disabled={isPending}>
        Delete
      </button>
    </div>
  );
}
