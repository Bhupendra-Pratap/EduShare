"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, BookOpen, Layers, Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export function DepartmentManager({ institutions }: { institutions: any[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{ type: string; institutionId?: string; departmentId?: string; yearGroupId?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCreate = async () => {
    if (!modal) return;
    setLoading(true);
    try {
      let url = "", body: any = {};
      if (modal.type === "dept") {
        url = "/api/admin/departments";
        body = { name: form.name, code: form.code, institutionId: modal.institutionId };
      } else if (modal.type === "subject") {
        url = "/api/admin/subjects";
        body = { name: form.name, code: form.code, description: form.description, yearGroupId: modal.yearGroupId };
      } else if (modal.type === "topic") {
        url = "/api/admin/topics";
        body = { name: form.name, subjectId: modal.yearGroupId };
      } else if (modal.type === "yeargroup") {
        url = "/api/admin/yeargroups";
        body = { label: form.label, yearNumber: parseInt(form.yearNumber || "1"), departmentId: modal.departmentId };
      }

      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Created successfully!");
      setModal(null);
      setForm({});
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {institutions.map(inst => (
        <div key={inst.id} className="card overflow-hidden">
          <button
            onClick={() => toggle(inst.id)}
            className="w-full flex items-center gap-3 p-5 hover:bg-ink-50 transition-all"
          >
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-body font-semibold text-ink-900">{inst.name}</p>
              <p className="text-xs font-body text-ink-500">{inst.departments.length} departments</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setModal({ type: "dept", institutionId: inst.id }); }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-navy-950 text-white rounded-lg text-xs font-body font-semibold hover:bg-navy-800"
            >
              <Plus className="w-3 h-3" /> Department
            </button>
            {expanded[inst.id] ? <ChevronDown className="w-4 h-4 text-ink-400" /> : <ChevronRight className="w-4 h-4 text-ink-400" />}
          </button>

          {expanded[inst.id] && (
            <div className="border-t border-ink-100">
              {inst.departments.length === 0 ? (
                <p className="p-5 text-sm font-body text-ink-400 text-center">No departments yet</p>
              ) : inst.departments.map((dept: any) => (
                <div key={dept.id} className="border-b border-ink-50 last:border-0">
                  <button
                    onClick={() => toggle(dept.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50 transition-all"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full ml-4" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-body font-semibold text-ink-800">{dept.name}</p>
                      <p className="text-xs font-body text-ink-500">{dept.code} · {dept._count.users} students</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setModal({ type: "yeargroup", departmentId: dept.id }); }}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-body font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Year
                    </button>
                    {expanded[dept.id] ? <ChevronDown className="w-4 h-4 text-ink-400" /> : <ChevronRight className="w-4 h-4 text-ink-400" />}
                  </button>

                  {expanded[dept.id] && dept.yearGroups.map((yg: any) => (
                    <div key={yg.id} className="bg-ink-50/50">
                      <div className="flex items-center gap-3 px-8 py-2.5">
                        <Layers className="w-3.5 h-3.5 text-ink-400" />
                        <span className="text-xs font-body font-semibold text-ink-700 flex-1">{yg.label}</span>
                        <button
                          onClick={() => setModal({ type: "subject", yearGroupId: yg.id })}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-body font-semibold"
                        >
                          <Plus className="w-3 h-3" /> Subject
                        </button>
                      </div>
                      {yg.subjects.map((subj: any) => (
                        <div key={subj.id} className="flex items-center gap-2 px-12 py-2 border-t border-ink-100">
                          <span className="text-xs font-body text-ink-700 flex-1">{subj.name}</span>
                          <span className="text-[10px] font-body text-ink-400">{subj.code}</span>
                          <span className="text-[10px] font-body text-ink-400">{subj._count.topics} topics</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-up">
            <h2 className="section-title mb-4">
              Add {modal.type === "dept" ? "Department" : modal.type === "subject" ? "Subject" : modal.type === "yeargroup" ? "Year Group" : "Topic"}
            </h2>
            <div className="space-y-3">
              {(modal.type === "dept" || modal.type === "subject") && (
                <>
                  <div>
                    <label className="label">Name *</label>
                    <input className="input" value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="label">Code *</label>
                    <input className="input" value={form.code || ""} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required />
                  </div>
                  {modal.type === "subject" && (
                    <div>
                      <label className="label">Description</label>
                      <input className="input" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                  )}
                </>
              )}
              {modal.type === "yeargroup" && (
                <>
                  <div>
                    <label className="label">Label (e.g. 1st Year)</label>
                    <input className="input" value={form.label || ""} onChange={e => setForm({...form, label: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Year number</label>
                    <select className="input" value={form.yearNumber || "1"} onChange={e => setForm({...form, yearNumber: e.target.value})}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>Year {n}</option>)}
                    </select>
                  </div>
                </>
              )}
              {modal.type === "topic" && (
                <div>
                  <label className="label">Topic name *</label>
                  <input className="input" value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
