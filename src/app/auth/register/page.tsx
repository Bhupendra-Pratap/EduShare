"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "STUDENT",
    institutionId: "", departmentId: "", yearGroup: "",
  });

  useEffect(() => {
    fetch("/api/institutions/public").then(r => r.json()).then(setInstitutions);
  }, []);

  useEffect(() => {
    if (form.institutionId) {
      fetch(`/api/institutions/${form.institutionId}/departments`)
        .then(r => r.json()).then(setDepartments);
    }
  }, [form.institutionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCard) return toast.error("Please upload your ID card");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("idCard", idCard);
      const res = await fetch("/api/auth/register", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Registration submitted! Awaiting admin verification.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-navy-950">EduShare</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-navy-950 mb-1">Create account</h1>
          <p className="text-sm font-body text-ink-500">
            Already have one?{" "}
            <Link href="/auth/login" className="text-navy-950 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step >= s ? "bg-navy-950 text-white" : "bg-ink-200 text-ink-500"}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-navy-950" : "bg-ink-200"}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-fade-up">
                <h2 className="section-title mb-4">Personal information</h2>
                <div>
                  <label className="label">Full name</label>
                  <input className="input" placeholder="Arjun Mehta" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input type="email" className="input" placeholder="you@university.edu" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} className="input pr-10"
                      placeholder="Min. 8 characters" value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">I am a</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[{v:"STUDENT",l:"Student"},{v:"TEACHER",l:"Teacher / Faculty"}].map(r => (
                      <button key={r.v} type="button"
                        onClick={() => setForm({...form, role: r.v})}
                        className={`py-3 rounded-xl border-2 text-sm font-body font-semibold transition-all ${form.role === r.v ? "border-navy-950 bg-navy-950 text-white" : "border-ink-200 text-ink-600 hover:border-ink-400"}`}>
                        {r.l}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-3 mt-2">
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-up">
                <h2 className="section-title mb-4">Institution details</h2>
                <div>
                  <label className="label">Institution</label>
                  <select className="input" value={form.institutionId}
                    onChange={e => setForm({...form, institutionId: e.target.value, departmentId: ""})} required>
                    <option value="">Select your institution...</option>
                    {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                {departments.length > 0 && (
                  <div>
                    <label className="label">Department</label>
                    <select className="input" value={form.departmentId}
                      onChange={e => setForm({...form, departmentId: e.target.value})}>
                      <option value="">Select department...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                {form.role === "STUDENT" && (
                  <div>
                    <label className="label">Current year</label>
                    <select className="input" value={form.yearGroup}
                      onChange={e => setForm({...form, yearGroup: e.target.value})}>
                      <option value="">Select year...</option>
                      {["1","2","3","4"].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                  <button type="button" onClick={() => setStep(3)}
                    disabled={!form.institutionId} className="btn-primary flex-1 py-3">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-up">
                <h2 className="section-title mb-4">ID Verification</h2>
                <p className="text-sm font-body text-ink-500 leading-relaxed">
                  Upload a clear photo of your {form.role === "TEACHER" ? "faculty" : "student"} ID card.
                  Your account will be reviewed by the institution admin.
                </p>
                <div
                  onClick={() => document.getElementById("idcard-input")?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${idCard ? "border-emerald-400 bg-emerald-50" : "border-ink-300 hover:border-navy-950 hover:bg-ink-50"}`}>
                  <input id="idcard-input" type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => setIdCard(e.target.files?.[0] || null)} />
                  {idCard ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-body font-semibold text-emerald-700">{idCard.name}</p>
                        <p className="text-xs font-body text-emerald-600">{(idCard.size/1024).toFixed(1)} KB</p>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); setIdCard(null); }}
                        className="ml-2 text-emerald-600 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-ink-400 mx-auto mb-2" />
                      <p className="text-sm font-body font-semibold text-ink-700">Click to upload ID card</p>
                      <p className="text-xs font-body text-ink-400 mt-1">JPG, PNG or PDF, max 5MB</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                  <button type="submit" disabled={loading || !idCard} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
