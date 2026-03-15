"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function TeacherVerifyActions({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handle = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/teacher/notes/${noteId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "approve" ? "Note verified!" : "Note rejected");
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handle("approve")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-body font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
      >
        {loading === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Verify & Approve
      </button>
      <button
        onClick={() => handle("reject")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-body font-semibold hover:bg-red-200 transition-all disabled:opacity-50"
      >
        {loading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
        Reject
      </button>
    </div>
  );
}
