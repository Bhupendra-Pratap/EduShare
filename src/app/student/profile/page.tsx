"use client";

import { useEffect, useState } from "react";
import { User, Mail, BookOpen, Calendar, FileText, Loader2, Save } from "lucide-react";
import { formatDate, verificationBadge, roleColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { NoteCard } from "@/components/shared/NoteCard";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      setUser(d.user);
      setBio(d.user.bio || "");
    });
    fetch("/api/student/notes").then(r => r.json()).then(setNotes);
  }, []);

  const saveBio = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
    </div>
  );

  const badge = verificationBadge(user.verificationStatus);

  return (
    <div className="space-y-6">
      <h1 className="page-title">My Profile</h1>

      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-navy-950 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-display font-semibold text-white">
              {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900">{user.name}</h2>
                <p className="text-sm font-body text-ink-500 mt-0.5">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <span className={cn("badge", roleColor(user.role))}>{user.role}</span>
                <span className={cn("badge", badge.color)}>{badge.label}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm font-body text-ink-500">
              {user.institution && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> {user.institution.name}
                </span>
              )}
              {user.department && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {user.department.name}
                </span>
              )}
              {user.yearGroup && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Year {user.yearGroup}
                </span>
              )}
            </div>

            {/* Bio */}
            <div className="mt-4">
              {editing ? (
                <div className="flex gap-2">
                  <textarea
                    className="input resize-none flex-1"
                    rows={2}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                  />
                  <div className="flex flex-col gap-2">
                    <button onClick={saveBio} disabled={saving} className="btn-primary px-3 py-2 flex items-center gap-1 text-xs">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary px-3 py-2 text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="text-sm font-body text-ink-600 flex-1">
                    {user.bio || <span className="text-ink-400 italic">No bio yet</span>}
                  </p>
                  <button onClick={() => setEditing(true)} className="text-xs font-body font-semibold text-navy-700 hover:underline flex-shrink-0">
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My notes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="section-title">My Notes</h2>
          <span className="badge bg-ink-100 text-ink-600">{notes.length}</span>
        </div>
        {notes.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-8 h-8 text-ink-300 mx-auto mb-2" />
            <p className="font-body text-ink-400">You haven&apos;t uploaded any notes yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 stagger">
            {notes.map((note: any) => (
              <NoteCard key={note.id} note={{ ...note, createdAt: note.createdAt }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
