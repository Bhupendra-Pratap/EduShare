"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Link2, Image, X, Loader2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", fileType: "PDF",
    subjectId: "", topicId: "", content: "", fileUrl: "", tags: [] as string[],
  });

  useEffect(() => {
    fetch("/api/student/subjects").then(r => r.json()).then(setSubjects);
  }, []);

  useEffect(() => {
    if (form.subjectId) {
      fetch(`/api/student/subjects/${form.subjectId}/topics`)
        .then(r => r.json()).then(setTopics);
    } else {
      setTopics([]);
    }
  }, [form.subjectId]);

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topicId) return toast.error("Please select a topic");
    if (form.fileType !== "TEXT" && form.fileType !== "LINK" && !file)
      return toast.error("Please attach a file");

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "tags") fd.append(k, JSON.stringify(v));
        else fd.append(k, v as string);
      });
      if (file) fd.append("file", file);

      const res = await fetch("/api/student/notes", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success("Note uploaded successfully!");
      router.push("/student/notes");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fileTypeOptions = [
    { value: "PDF", label: "PDF", icon: FileText },
    { value: "IMAGE", label: "Image", icon: Image },
    { value: "TEXT", label: "Text note", icon: FileText },
    { value: "LINK", label: "Link", icon: Link2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Upload a Note</h1>
        <p className="text-sm font-body text-ink-500 mt-1">Share your knowledge with your fellow students</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="label">Note title *</label>
          <input className="input" required placeholder="e.g. Complete DSA notes with examples"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={2} placeholder="Brief description of what this note covers..."
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>

        {/* Subject & Topic */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Subject *</label>
            <select className="input" required value={form.subjectId}
              onChange={e => setForm({...form, subjectId: e.target.value, topicId: ""})}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Topic *</label>
            <select className="input" required value={form.topicId}
              onChange={e => setForm({...form, topicId: e.target.value})} disabled={!form.subjectId}>
              <option value="">Select topic...</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* File type */}
        <div>
          <label className="label">Note type *</label>
          <div className="grid grid-cols-4 gap-2">
            {fileTypeOptions.map(ft => (
              <button
                key={ft.value}
                type="button"
                onClick={() => setForm({...form, fileType: ft.value})}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-body font-semibold transition-all ${
                  form.fileType === ft.value ? "border-navy-950 bg-navy-950 text-white" : "border-ink-200 text-ink-600 hover:border-ink-400"
                }`}
              >
                <ft.icon className="w-4 h-4" />
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {/* File upload */}
        {(form.fileType === "PDF" || form.fileType === "IMAGE") && (
          <div>
            <label className="label">Attach file *</label>
            <div
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                file ? "border-emerald-400 bg-emerald-50" : "border-ink-300 hover:border-navy-950 hover:bg-ink-50"
              }`}
            >
              <input
                id="file-input" type="file" className="hidden"
                accept={form.fileType === "PDF" ? ".pdf" : "image/*"}
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div>
                    <p className="text-sm font-body font-semibold text-emerald-700">{file.name}</p>
                    <p className="text-xs font-body text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="text-emerald-600 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-ink-400 mx-auto mb-2" />
                  <p className="text-sm font-body font-semibold text-ink-700">
                    Click to upload {form.fileType === "PDF" ? "PDF" : "image"}
                  </p>
                  <p className="text-xs font-body text-ink-400 mt-1">Max 10MB</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Text content */}
        {form.fileType === "TEXT" && (
          <div>
            <label className="label">Note content *</label>
            <textarea className="input resize-none" rows={8}
              placeholder="Write your note here..."
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
              required
            />
          </div>
        )}

        {/* Link */}
        {form.fileType === "LINK" && (
          <div>
            <label className="label">URL *</label>
            <input type="url" className="input" placeholder="https://..."
              value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} required />
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <div className="flex gap-2">
            <input className="input" placeholder="Add a tag..."
              value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <button type="button" onClick={addTag} className="btn-secondary px-4">Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 badge bg-gold-100 text-gold-700">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                  <button type="button" onClick={() => setForm(f => ({...f, tags: f.tags.filter(t => t !== tag)}))}
                    className="hover:text-red-600">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Note
        </button>
      </form>
    </div>
  );
}
