"use client";

import { useState } from "react";
import { MoreHorizontal, UserX, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function UserActions({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleActive = async () => {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(isActive ? "User deactivated" : "User activated");
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-ink-400" /> : <MoreHorizontal className="w-4 h-4 text-ink-400" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-ink-200 rounded-xl shadow-lg w-40 py-1 overflow-hidden">
            <button
              onClick={toggleActive}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-body font-medium transition-colors ${
                isActive ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {isActive ? <><UserX className="w-3.5 h-3.5" /> Deactivate</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
