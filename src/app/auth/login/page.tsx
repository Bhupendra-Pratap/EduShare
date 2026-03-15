"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      toast.success(`Welcome back, ${data.user.name}!`);
      const role = data.user.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") router.push("/admin");
      else if (role === "TEACHER") router.push("/teacher/dashboard");
      else router.push("/student/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email: string, pass: string) => {
    setForm({ email, password: pass });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Logged in as ${data.user.role.toLowerCase()}`);
      const role = data.user.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") router.push("/admin");
      else if (role === "TEACHER") router.push("/teacher/dashboard");
      else router.push("/student/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-950 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-white">EduShare</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold text-white leading-tight mb-4">
            Welcome back to your academic community
          </h2>
          <p className="font-body text-ink-400 text-base leading-relaxed">
            Access thousands of verified notes, connect with peers, and accelerate your learning journey.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "50K+", label: "Students" },
            { value: "200+", label: "Institutions" },
            { value: "2K+", label: "Notes" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-xl p-4">
              <div className="font-display text-2xl text-gold-400 font-semibold">{s.value}</div>
              <div className="text-xs font-body text-ink-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-navy-950">EduShare</span>
          </div>

          <h1 className="font-display text-3xl font-semibold text-navy-950 mb-1">Sign in</h1>
          <p className="text-sm font-body text-ink-500 mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-navy-950 font-semibold hover:underline">
              Register
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-xs font-body font-semibold text-ink-400 uppercase tracking-wide mb-3">
              Demo accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Student", email: "student@iitd.ac.in", pass: "student123", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { label: "Teacher", email: "prof.sharma@iitd.ac.in", pass: "teacher123", color: "bg-blue-50 text-blue-700 border-blue-200" },
                { label: "Admin", email: "admin@iitd.ac.in", pass: "admin123", color: "bg-purple-50 text-purple-700 border-purple-200" },
                { label: "Super Admin", email: "superadmin@edushare.com", pass: "superadmin123", color: "bg-orange-50 text-orange-700 border-orange-200" },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => demoLogin(d.email, d.pass)}
                  disabled={loading}
                  className={`text-xs font-body font-semibold px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.02] ${d.color}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
