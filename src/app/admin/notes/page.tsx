import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NoteCard } from "@/components/shared/NoteCard";

export const metadata = { title: "All Notes" };

export default async function AdminNotesPage() {
  const session = await getSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const notes = await prisma.note.findMany({
    where: isSuperAdmin ? {} : {
      author: { institutionId: session?.institutionId || "" },
    },
    include: {
      author: { select: { name: true, role: true } },
      topic: { include: { subject: { select: { name: true } } } },
      _count: { select: { votes: true, comments: true, bookmarks: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">All Notes</h1>
        <p className="text-sm font-body text-ink-500 mt-1">{notes.length} notes in total</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {notes.map(note => (
          <NoteCard key={note.id} note={{ ...note, createdAt: note.createdAt.toISOString() }} />
        ))}
      </div>
      {notes.length === 0 && (
        <div className="card p-16 text-center">
          <p className="font-body text-ink-400">No notes yet</p>
        </div>
      )}
    </div>
  );
}
