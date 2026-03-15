"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function InstitutionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "", address: "", website: "", adminEmail: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Institution created!");
      setOpen(false);
      setForm({ name: "", code: "", description: "", address: "", website: "", adminEmail: "" });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add Institution
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Create Institution</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-ink-100 rounded-lg">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Institution name *</label>
                  <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Indian Institute of Technology Delhi" />
                </div>
                <div>
                  <label className="label">Short code *</label>
                  <input className="input" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="IIT-DELHI" />
                </div>
                <div>
                  <label className="label">Admin email</label>
                  <input type="email" className="input" value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} placeholder="admin@iitd.ac.in" />
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input className="input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input className="input" value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
