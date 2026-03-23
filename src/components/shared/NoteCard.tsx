"use client";

import { useState } from "react";
import { FileText, Download, BookmarkPlus, ThumbsUp, CheckCircle, MessageSquare, Bookmark } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    description?: string | null;
    fileType: string;
    fileUrl?: string | null;
    isVerified: boolean;
    viewCount: number;
    downloadCount: number;
    createdAt: string | Date;
    tags: string[];
    author: { name: string; role: string };
    topic: { name: string; subject?: { name: string } };
    _count?: { votes: number; comments: number; bookmarks: number };
  };
  showActions?: boolean;
}

export function NoteCard({ note, showActions = true }: NoteCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [votes, setVotes] = useState(note._count?.votes || 0);
  const [voted, setVoted] = useState(false);

  const handleVote = async () => {
    if (voted) return;
    try {
      const res = await fetch(`/api/notes/${note.id}/vote`, { method: "POST" });
      if (res.ok) { setVotes(v => v + 1); setVoted(true); }
    } catch { toast.error("Failed to vote"); }
  };

  const handleBookmark = async () => {
    try {
      const res = await fetch(`/api/notes/${note.id}/bookmark`, {
        method: bookmarked ? "DELETE" : "POST",
      });
      if (res.ok) {
        setBookmarked(!bookmarked);
        toast.success(bookmarked ? "Removed bookmark" : "Bookmarked!");
      }
    } catch { toast.error("Failed"); }
  };

  const fileTypeIcon = () => {
    switch (note.fileType) {
      case "PDF": return "📄";
      case "IMAGE": return "🖼️";
      case "LINK": return "🔗";
      default: return "📝";
    }
  };

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-ink-100 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
          {fileTypeIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-body font-semibold text-ink-900 text-sm leading-snug group-hover:text-navy-700 transition-colors line-clamp-2">
              {note.title}
            </h3>
            {note.isVerified && (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            )}
          </div>

          {note.description && (
            <p className="text-xs font-body text-ink-500 mt-1 line-clamp-2">{note.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="badge bg-navy-50 text-navy-700 text-[10px]">
              {note.topic.subject?.name || note.topic.name}
            </span>
            <span className="badge bg-ink-100 text-ink-600 text-[10px]">{note.topic.name}</span>
            {note.tags.slice(0, 2).map(tag => (
              <span key={tag} className="badge bg-gold-50 text-gold-700 text-[10px]">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-navy-950 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">{getInitials(note.author.name)}</span>
          </div>
          <div>
            <span className="text-xs font-body font-medium text-ink-700">{note.author.name}</span>
            {note.author.role === "TEACHER" && (
              <span className="ml-1 text-[9px] font-semibold text-blue-600 uppercase">Faculty</span>
            )}
          </div>
          <span className="text-ink-300">·</span>
          <span className="text-xs font-body text-ink-400">{formatDate(note.createdAt)}</span>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleVote}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-body font-medium transition-all ${voted ? "bg-navy-950 text-white" : "text-ink-500 hover:bg-ink-100"}`}
            >
              <ThumbsUp className="w-3 h-3" />
              {votes}
            </button>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-all ${bookmarked ? "bg-gold-100 text-gold-600" : "text-ink-400 hover:bg-ink-100"}`}
            >
              {bookmarked ? <Bookmark className="w-3.5 h-3.5 fill-current" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            </button>
            {note.fileUrl && (
              <a
                href={
                  note.fileType === "PDF" && note.fileUrl.includes("cloudinary")
                    ? note.fileUrl.replace("/upload/", "/upload/fl_attachment/")
                    : note.fileUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-body font-medium text-ink-500 hover:bg-ink-100 transition-all"
              >
                <Download className="w-3 h-3" />
                {note.fileType === "PDF" ? "Open PDF" : "Download"}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
