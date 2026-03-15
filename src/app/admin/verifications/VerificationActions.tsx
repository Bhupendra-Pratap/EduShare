"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function VerificationActions({ verificationId, userId }: { verificationId: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const handle = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success(action === "approve" ? "User approved!" : "Request rejected");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
      setShowReject(false);
    }
  };

  if (showReject) {
    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <textarea
          className="input text-xs resize-none"
          rows={2}
          placeholder="Reason for rejection..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={() => setShowReject(false)} className="btn-secondary text-xs py-1.5 flex-1">Cancel</button>
          <button
            onClick={() => handle("reject")}
            disabled={!reason || loading === "reject"}
            className="btn-danger text-xs py-1.5 flex-1 flex items-center justify-center gap-1"
          >
            {loading === "reject" && <Loader2 className="w-3 h-3 animate-spin" />}
            Reject
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle("approve")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-body font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
      >
        {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        Approve
      </button>
      <button
        onClick={() => setShowReject(true)}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-body font-semibold hover:bg-red-200 transition-all disabled:opacity-50"
      >
        <XCircle className="w-3 h-3" />
        Reject
      </button>
    </div>
  );
}
