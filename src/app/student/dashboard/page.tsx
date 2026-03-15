import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NoteCard } from "@/components/shared/NoteCard";
import { StatCard } from "@/components/shared/StatCard";
import { FileText, Bookmark, ThumbsUp, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { verificationBadge } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const session = await getSession();

  if (!session) return null;

  const isPending = session.verificationStatus === "PENDING";
  const isRejected = session.verificationStatus === "REJECTED";

  const [noteCount, bookmarkCount, voteCount, recentNotes] = await Promise.all([
    prisma.note.count({ where: { authorId: session.id } }),
    prisma.bookmark.count({ where: { userId: session.id } }),
    prisma.vote.count({
      where: { note: { authorId: session.id } },
    }),
    session.verificationStatus === "APPROVED"
      ? prisma.note.findMany({
          where: session.institutionId
            ? { author: { institutionId: session.institutionId } }
            : {},
          include: {
            author: { select: { name: true, role: true } },
            topic: { include: { subject: { select: { name: true } } } },
            _count: { select: { votes: true, comments: true, bookmarks: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Welcome back, {session.name.split(" ")[0]} 👋</h1>
        <p className="text-sm font-body text-ink-500 mt-1">
          {session.institution?.name || "EduShare"} · {session.department?.name}
        </p>
      </div>

      {/* Verification banner */}
      {isPending && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-body font-semibold text-amber-800">Verification pending</p>
            <p className="text-xs font-body text-amber-700 mt-0.5">
              Your ID card is being reviewed by the institution admin. You&apos;ll get access once approved.
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
              Your verification was rejected. Please contact your institution admin for details.
            </p>
          </div>
        </div>
      )}
      {session.verificationStatus === "APPROVED" && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-body font-semibold text-emerald-700">Verified student</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        <StatCard title="My Notes" value={noteCount} icon={FileText} iconColor="bg-blue-500" />
        <StatCard title="Bookmarks" value={bookmarkCount} icon={Bookmark} iconColor="bg-gold-500" />
        <StatCard title="Upvotes received" value={voteCount} icon={ThumbsUp} iconColor="bg-emerald-500" />
      </div>

      {/* Recent notes */}
      {session.verificationStatus === "APPROVED" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Notes</h2>
            <Link href="/student/notes" className="text-xs font-body font-semibold text-navy-700 hover:underline">
              View all
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="font-body font-semibold text-ink-600">No notes yet</p>
              <p className="text-sm font-body text-ink-400 mt-1">Be the first to share notes in your institution!</p>
              <Link href="/student/upload" className="btn-primary inline-flex mt-4">Upload a note</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 stagger">
              {recentNotes.map(note => (
                <NoteCard key={note.id} note={{ ...note, createdAt: note.createdAt.toISOString() }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
