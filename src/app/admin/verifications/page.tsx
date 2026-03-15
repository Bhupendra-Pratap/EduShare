import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { VerificationActions } from "./VerificationActions";
import { formatDate, verificationBadge, roleColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const metadata = { title: "Verifications" };

export default async function VerificationsPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await getSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";
  const status = searchParams.status || "PENDING";

  const verifications = await prisma.verificationRequest.findMany({
    where: {
      status: status as any,
      ...(isSuperAdmin ? {} : { institutionId: session?.institutionId || undefined }),
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, idCardUrl: true } },
      institution: { select: { name: true, code: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Verification Requests</h1>
        <p className="text-sm font-body text-ink-500 mt-1">Review student and teacher ID submissions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <a
            key={s}
            href={`/admin/verifications?status=${s}`}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all",
              status === s ? "bg-navy-950 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
            )}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {verifications.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="font-body text-ink-400">No {status.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {verifications.map((v) => {
            const badge = verificationBadge(v.status);
            return (
              <div key={v.id} className="card p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-11 h-11 bg-navy-950 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {v.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-body font-semibold text-ink-900">{v.user.name}</p>
                      <p className="text-xs font-body text-ink-500">{v.user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("badge text-[10px]", roleColor(v.user.role))}>
                          {v.user.role}
                        </span>
                        <span className="text-ink-300 text-xs">·</span>
                        <span className="text-xs font-body text-ink-500">{v.institution.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* ID Card preview */}
                  {v.idCardUrl && (
                    <a
                      href={v.idCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-ink-50 rounded-xl border border-ink-200 text-sm font-body font-medium text-ink-700 hover:bg-ink-100 transition-all"
                    >
                      🪪 View ID Card
                    </a>
                  )}

                  {/* Status & actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className={cn("badge text-xs", badge.color)}>{badge.label}</span>
                      <p className="text-[10px] font-body text-ink-400 mt-1">{formatDate(v.createdAt)}</p>
                      {v.reviewedBy && (
                        <p className="text-[10px] font-body text-ink-400">by {v.reviewedBy.name}</p>
                      )}
                    </div>

                    {v.status === "PENDING" && (
                      <VerificationActions verificationId={v.id} userId={v.user.id} />
                    )}
                  </div>
                </div>

                {v.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs font-body text-red-700">
                      <span className="font-semibold">Rejection reason:</span> {v.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
