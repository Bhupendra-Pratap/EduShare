"use client";

import { useState, useEffect } from "react";
import { NoteCard } from "@/components/shared/NoteCard";
import { Search, Loader2 } from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topicId, setTopicId] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    fetch("/api/student/subjects/all-topics")
      .then((r) => r.json())
      .then(setTopics);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (topicId) params.set("topicId", topicId);
    if (verifiedOnly) params.set("verified", "1");

    fetch("/api/student/notes/browse?" + params.toString())
      .then((r) => r.json())
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, topicId, verifiedOnly]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Browse Notes</h1>
        <p className="text-sm font-body text-ink-500 mt-1">
          {notes.length} notes in your institution
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            className="input pl-10"
            placeholder="Search by title, topic, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="input w-auto"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            <option value="">All topics</option>
            {topics.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.subjectName} — {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-body font-semibold border transition-all " +
              (verifiedOnly
                ? "bg-navy-950 text-white border-navy-950"
                : "bg-white border-ink-200 text-ink-600 hover:bg-ink-50")
            }
          >
            ✓ Verified only
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="font-body text-ink-400">No notes found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 stagger">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}