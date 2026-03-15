import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NoteCard } from "@/components/shared/NoteCard";
import { TeacherVerifyActions } from "./TeacherVerifyActions";
import { CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = { title: "Verify Notes" };

export default async function VerifyNotesPage() {
  const session = await getSession();
  if (!session || session.verificationStatus !== "APPROVED") redirect("/teacher/dashboard");

  const notes = await prisma.note.findMany({
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
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Verify Notes</h1>
        <p className="text-sm font-body text-ink-500 mt-1">
          {notes.length} student note{notes.length !== 1 ? "s" : ""} awaiting your review
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="font-body font-semibold text-ink-700">All caught up!</p>
          <p className="text-sm font-body text-ink-400 mt-1">No student notes are pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="card p-5">
              <NoteCard note={{ ...note, createdAt: note.createdAt.toISOString() }} showActions={false} />
              <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between">
                <div className="text-xs font-body text-ink-400">
                  {note.fileUrl && (
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-navy-700 font-semibold hover:underline mr-4">
                      📎 View attachment
                    </a>
                  )}
                  {note.content && <span>Has text content</span>}
                </div>
                <TeacherVerifyActions noteId={note.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
