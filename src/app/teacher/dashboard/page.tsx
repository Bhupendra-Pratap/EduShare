import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StatCard } from "@/components/shared/StatCard";
import { NoteCard } from "@/components/shared/NoteCard";
import { FileText, CheckCircle, Users, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Teacher Dashboard" };

export default async function TeacherDashboard() {
  const session = await getSession();
  if (!session) return null;

  const isPending = session.verificationStatus === "PENDING";
  const isRejected = session.verificationStatus === "REJECTED";

  const [myNoteCount, unverifiedCount, studentCount, recentUnverified] = await Promise.all([
    prisma.note.count({ where: { authorId: session.id } }),
    prisma.note.count({
      where: {
        isVerified: false,
        isPublic: true,
        author: { institutionId: session.institutionId || "", role: "STUDENT" },
      },
    }),
    prisma.user.count({
      where: {
        institutionId: session.institutionId || "",
        role: "STUDENT",
        verificationStatus: "APPROVED",
      },
    }),
    session.verificationStatus === "APPROVED"
      ? prisma.note.findMany({
          where: {
            isVerified: false,
            isPublic: true,
            author: { institutionId: session.institutionId || "", role: "STUDENT" },
          },
          include: {
            author: { select: { name: true, role: true } },
            topic: { include: { subject: { select: { name: true } } } },
            _count: { select: { votes: true, comments: true, bookmarks: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="text-sm font-body text-ink-500 mt-1">
          {session.institution?.name || "EduShare"} · {session.department?.name}
        </p>
      </div>

      {/* Verification banners */}
      {isPending && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-body font-semibold text-amber-800">Verification pending</p>
            <p className="text-xs font-body text-amber-700 mt-0.5">
              Your faculty ID is being reviewed. You&apos;ll get full access once approved.
            </p>
          </div>
        </div>
      )}
      {isRejected && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-body font-semibold text-red-800">Verification rejected</p>
            <p className="text-xs font-body text-red-700 mt-0.5">
              Please contact the institution admin for assistance.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        <StatCard title="My Materials" value={myNoteCount} icon={FileText} iconColor="bg-blue-500" />
        <StatCard title="Awaiting Review" value={unverifiedCount} icon={CheckCircle} iconColor="bg-amber-500" />
        <StatCard title="Students" value={studentCount} icon={Users} iconColor="bg-emerald-500" />
      </div>

      {/* Notes awaiting verification */}
      {session.verificationStatus === "APPROVED" && recentUnverified.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Notes Awaiting Verification</h2>
            <Link href="/teacher/verify" className="text-xs font-body font-semibold text-navy-700 hover:underline">
              View all ({unverifiedCount})
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4 stagger">
            {recentUnverified.map(note => (
              <div key={note.id} className="relative">
                <NoteCard note={{ ...note, createdAt: note.createdAt.toISOString() }} showActions={false} />
                <div className="absolute top-3 right-3">
                  <Link
                    href={`/teacher/verify?noteId=${note.id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-body font-semibold hover:bg-blue-600 transition-all"
                  >
                    <CheckCircle className="w-3 h-3" /> Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {session.verificationStatus === "APPROVED" && recentUnverified.length === 0 && (
        <div className="card p-10 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-body font-semibold text-ink-700">All caught up!</p>
          <p className="text-sm font-body text-ink-400 mt-1">No student notes are waiting for review.</p>
        </div>
      )}
    </div>
  );
}
