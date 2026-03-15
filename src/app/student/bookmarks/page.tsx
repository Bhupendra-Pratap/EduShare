import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NoteCard } from "@/components/shared/NoteCard";
import { Bookmark } from "lucide-react";

export const metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const session = await getSession();
  if (!session) return null;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.id },
    include: {
      note: {
        include: {
          author: { select: { name: true, role: true } },
          topic: { include: { subject: { select: { name: true } } } },
          _count: { select: { votes: true, comments: true, bookmarks: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Bookmarks</h1>
        <p className="text-sm font-body text-ink-500 mt-1">{bookmarks.length} saved notes</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="font-body font-semibold text-ink-600">No bookmarks yet</p>
          <p className="text-sm font-body text-ink-400 mt-1">Save notes you want to revisit by clicking the bookmark icon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 stagger">
          {bookmarks.map(b => (
            <NoteCard key={b.id} note={{ ...b.note, createdAt: b.note.createdAt.toISOString() }} />
          ))}
        </div>
      )}
    </div>
  );
}
