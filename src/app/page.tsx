import Link from "next/link";
import { BookOpen, Users, Shield, Star, ArrowRight, GraduationCap, FileText, Bookmark } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white overflow-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-white">EduShare</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-body font-medium text-ink-300 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/auth/register" className="bg-white text-navy-950 text-sm font-body font-semibold px-5 py-2.5 rounded-xl hover:bg-ink-100 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-32 max-w-6xl mx-auto text-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-navy-800 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-900 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm font-body text-ink-300 mb-8">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-current" />
            Verified academic community
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] mb-6 max-w-4xl mx-auto">
            Share notes.{" "}
            <em className="text-gold-400 not-italic">Excel together.</em>
          </h1>

          <p className="font-body text-lg text-ink-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A verified note-sharing platform built for universities and colleges. Students, teachers, and institutions
            collaborate in one trusted academic space.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-7 py-3.5 rounded-xl font-body font-semibold text-base transition-all duration-200 active:scale-95"
            >
              Join your institution
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 border border-white/20 hover:bg-white/5 text-white px-7 py-3.5 rounded-xl font-body font-semibold text-base transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50K+", label: "Students" },
            { value: "2,000+", label: "Notes shared" },
            { value: "200+", label: "Institutions" },
            { value: "500+", label: "Teachers" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-semibold text-gold-400">{s.value}</div>
              <div className="text-sm font-body text-ink-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-ink-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-navy-950 mb-4">
              Built for every role
            </h2>
            <p className="font-body text-ink-500 max-w-xl mx-auto">
              Three distinct panels for students, teachers, and administrators — each with the right tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {[
              {
                icon: GraduationCap,
                color: "bg-blue-500",
                title: "Student Panel",
                desc: "Join your institution after ID verification. Browse, upload, and bookmark notes organized by subject and topic. Request notes you need.",
                points: ["Upload PDF, images, text notes", "Vote and bookmark quality notes", "Request missing topics"],
              },
              {
                icon: Users,
                color: "bg-emerald-500",
                title: "Teacher Panel",
                desc: "Join with faculty credentials. Verify student notes, create topic threads, and upload reference material and past papers.",
                points: ["Get a 'Verified Teacher' badge", "Pin and moderate content", "Upload reference material"],
              },
              {
                icon: Shield,
                color: "bg-purple-500",
                title: "Admin Panel",
                desc: "Manage your institution's entire academic structure. Create departments, subjects, and approve users after ID verification.",
                points: ["Multi-institution management", "Approve/reject verifications", "Full analytics dashboard"],
              },
            ].map((f) => (
              <div key={f.title} className="card p-7 hover:shadow-md transition-all">
                <div className={`w-11 h-11 ${f.color} rounded-2xl flex items-center justify-center mb-5`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-navy-950 mb-2">{f.title}</h3>
                <p className="font-body text-sm text-ink-500 mb-4 leading-relaxed">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs font-body text-ink-600">
                      <div className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-navy-950 mb-4">How it works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "01", icon: Users, title: "Sign up", desc: "Create your account with your institution email" },
              { step: "02", icon: Shield, title: "Verify identity", desc: "Upload your student or faculty ID card" },
              { step: "03", icon: BookOpen, title: "Join subjects", desc: "Access your department, year, and subjects" },
              { step: "04", icon: FileText, title: "Share & learn", desc: "Upload notes and download from peers" },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-ink-200 z-0" />
                )}
                <div className="relative z-10 inline-flex flex-col items-center">
                  <div className="w-16 h-16 bg-navy-950 rounded-2xl flex items-center justify-center mb-4">
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-body font-bold text-gold-500 mb-1">{s.step}</div>
                  <h4 className="font-display text-base font-semibold text-navy-950 mb-1">{s.title}</h4>
                  <p className="text-xs font-body text-ink-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-950 py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-4xl font-semibold text-white mb-4">
            Ready to start learning together?
          </h2>
          <p className="font-body text-ink-400 mb-8">
            Join thousands of students and teachers already sharing knowledge on EduShare.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-xl font-body font-semibold text-base transition-all active:scale-95"
          >
            Create your account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 border-t border-white/10 py-8 text-center">
        <p className="text-xs font-body text-ink-600">
          © {new Date().getFullYear()} EduShare. Built for academic excellence.
        </p>
      </footer>
    </div>
  );
}
