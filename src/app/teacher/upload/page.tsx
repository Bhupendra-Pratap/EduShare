"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Link2, Image, X, Loader2, Tag, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TeacherUploadPage() {
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
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "tags") fd.append(k, JSON.stringify(v));
        else fd.append(k, v as string);
      });
      if (file) fd.append("file", file);

      const res = await fetch("/api/teacher/notes", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Material uploaded and auto-verified!");
      router.push("/teacher/notes");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fileTypeOptions = [
    { value: "PDF", label: "PDF", icon: FileText },
    { value: "IMAGE", label: "Image", icon: Image },
    { value: "TEXT", label: "Text", icon: FileText },
    { value: "LINK", label: "Link", icon: Link2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Upload Teaching Material</h1>
        <p className="text-sm font-body text-ink-500 mt-1">
          Your materials are automatically marked as teacher-verified
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl w-fit">
        <Star className="w-4 h-4 text-blue-600 fill-current" />
        <span className="text-sm font-body font-semibold text-blue-700">
          Teacher content is auto-verified and pinned for students
        </span>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Material title *</label>
          <input className="input" required placeholder="e.g. Week 3 — Dynamic Programming Reference Sheet"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={2}
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
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

        <div>
          <label className="label">Type *</label>
          <div className="grid grid-cols-4 gap-2">
            {fileTypeOptions.map(ft => (
              <button key={ft.value} type="button"
                onClick={() => setForm({...form, fileType: ft.value})}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-body font-semibold transition-all ${
                  form.fileType === ft.value ? "border-blue-500 bg-blue-500 text-white" : "border-ink-200 text-ink-600 hover:border-ink-400"
                }`}
              >
                <ft.icon className="w-4 h-4" />
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {(form.fileType === "PDF" || form.fileType === "IMAGE") && (
          <div>
            <label className="label">File *</label>
            <div onClick={() => document.getElementById("teacher-file")?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${file ? "border-blue-400 bg-blue-50" : "border-ink-300 hover:border-blue-400"}`}
            >
              <input id="teacher-file" type="file" className="hidden"
                accept={form.fileType === "PDF" ? ".pdf" : "image/*"}
                onChange={e => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div>
                    <p className="text-sm font-body font-semibold text-blue-700">{file.name}</p>
                    <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}>
                    <X className="w-4 h-4 text-blue-600 hover:text-red-600" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-ink-400 mx-auto mb-2" />
                  <p className="text-sm font-body font-semibold text-ink-700">Click to upload</p>
                  <p className="text-xs text-ink-400 mt-1">Max 10MB</p>
                </>
              )}
            </div>
          </div>
        )}
        {form.fileType === "TEXT" && (
          <div>
            <label className="label">Content *</label>
            <textarea className="input resize-none" rows={10} required
              value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          </div>
        )}
        {form.fileType === "LINK" && (
          <div>
            <label className="label">URL *</label>
            <input type="url" className="input" required placeholder="https://..."
              value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} />
          </div>
        )}

        <div>
          <label className="label">Tags</label>
          <div className="flex gap-2">
            <input className="input" placeholder="Add tag..." value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <button type="button" onClick={addTag} className="btn-secondary px-4">Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 badge bg-blue-100 text-blue-700">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                  <button type="button" onClick={() => setForm(f => ({...f, tags: f.tags.filter(t => t !== tag)}))}>
                    <X className="w-2.5 h-2.5 hover:text-red-600" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full py-3 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload & Auto-Verify
        </button>
      </form>
    </div>
  );
}
