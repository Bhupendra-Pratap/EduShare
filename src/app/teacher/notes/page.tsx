import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NoteCard } from "@/components/shared/NoteCard";
import { TeacherVerifyActions } from "../verify/TeacherVerifyActions";
import { redirect } from "next/navigation";

export const metadata = { title: "Browse Notes" };

export default async function TeacherNotesPage({
  searchParams,
}: { searchParams: { topicId?: string; verified?: string } }) {
  const session = await getSession();
  if (!session || session.verificationStatus !== "APPROVED") redirect("/teacher/dashboard");

  const { topicId, verified } = searchParams;

  const notes = await prisma.note.findMany({
    where: {
      author: { institutionId: session.institutionId || "" },
      isPublic: true,
      ...(topicId ? { topicId } : {}),
      ...(verified === "1" ? { isVerified: true } : verified === "0" ? { isVerified: false } : {}),
    },
    include: {
      author: { select: { name: true, role: true } },
      topic: { include: { subject: { select: { name: true } } } },
      _count: { select: { votes: true, comments: true, bookmarks: true } },
    },
    orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
    take: 40,
  });

  const topics = await prisma.topic.findMany({
    where: { subject: { yearGroup: { department: { institutionId: session.institutionId || "" } } } },
    include: { subject: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Browse Notes</h1>
        <p className="text-sm font-body text-ink-500 mt-1">{notes.length} notes in your institution</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", href: "/teacher/notes" },
          { label: "Unverified", href: "/teacher/notes?verified=0" },
          "use client";

          import { useState, useEffect } from "react";
          import { NoteCard } from "@/components/shared/NoteCard";
          import { TeacherVerifyActions } from "../verify/TeacherVerifyActions";
          import { Loader2 } from "lucide-react";

          export default function TeacherNotesPage() {
            const [notes, setNotes] = useState<any[]>([]);
            const [topics, setTopics] = useState<any[]>([]);
            const [loading, setLoading] = useState(true);
            const [filter, setFilter] = useState("");
            const [topicId, setTopicId] = useState("");

            useEffect(() => {
              fetch("/api/student/subjects/all-topics")
                .then((r) => r.json())
                .then(setTopics);
            }, []);

            useEffect(() => {
              setLoading(true);
              const params = new URLSearchParams();
              if (filter) params.set("verified", filter);
              if (topicId) params.set("topicId", topicId);

              fetch(`/api/teacher/notes/browse?${params.toString()}`)
                .then((r) => r.json())
                .then((data) => {
                  setNotes(Array.isArray(data) ? data : []);
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }, [filter, topicId]);

            return (
              <div className="space-y-6">
                <div>
                  <h1 className="page-title">Browse Notes</h1>
                  <p className="text-sm font-body text-ink-500 mt-1">{notes.length} notes</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All", value: "" },
                    { label: "Unverified", value: "0" },
                    { label: "Verified", value: "1" },
                  ].map((f) => (
                    <button
                      key={f.label}
                      onClick={() => setFilter(f.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-body font-semibold border transition-all ${
                        filter === f.value ? "bg-navy-950 text-white border-navy-950" : "bg-white border-ink-200 text-ink-600 hover:bg-ink-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <select className="input w-auto ml-auto" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
                    <option value="">All topics</option>
                    {topics.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.subjectName} - {t.name}</option>
                    ))}
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="card p-16 text-center"><p className="font-body text-ink-400">No notes found</p></div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="card p-5">
                        <NoteCard note={note} showActions={false} />
                        {!note.isVerified && note.author.role === "STUDENT" && (
                          <div className="mt-4 pt-4 border-t border-ink-100 flex justify-end">
                            <TeacherVerifyActions noteId={note.id} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
