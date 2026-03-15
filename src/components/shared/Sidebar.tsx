"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, LogOut, Menu, X,
  LayoutDashboard, Building2, Users, ShieldCheck, FileText,
  Bookmark, User, PlusCircle, CheckCircle, Layers,
} from "lucide-react";
import { useState } from "react";
import { cn, getInitials, roleColor } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV_ITEMS = {
  admin: [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/institutions", icon: Building2, label: "Institutions" },
    { href: "/admin/departments", icon: Layers, label: "Departments & Subjects" },
    { href: "/admin/verifications", icon: ShieldCheck, label: "Verifications" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/notes", icon: FileText, label: "All Notes" },
  ],
  student: [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/subjects", icon: BookOpen, label: "My Subjects" },
    { href: "/student/notes", icon: FileText, label: "Browse Notes" },
    { href: "/student/upload", icon: PlusCircle, label: "Upload Note" },
    { href: "/student/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/student/profile", icon: User, label: "Profile" },
  ],
  teacher: [
    { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/teacher/subjects", icon: BookOpen, label: "Subjects" },
    { href: "/teacher/notes", icon: FileText, label: "Browse Notes" },
    { href: "/teacher/upload", icon: PlusCircle, label: "Upload Material" },
    { href: "/teacher/verify", icon: CheckCircle, label: "Verify Notes" },
    { href: "/teacher/profile", icon: User, label: "Profile" },
  ],
};

interface SidebarProps {
  user: any;
  panel: "admin" | "student" | "teacher";
}

export function Sidebar({ user, panel }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_ITEMS[panel];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/auth/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-ink-100">
        <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="font-display text-lg font-semibold text-navy-950">EduShare</span>
      </div>

      <div className="px-4 py-4 border-b border-ink-100">
        <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl">
          <div className="w-9 h-9 bg-navy-950 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-body font-bold text-white">{getInitials(user.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-semibold text-ink-900 truncate">{user.name}</p>
            <span className={cn("badge text-[10px]", roleColor(user.role))}>
              {user.role.replace("_", " ")}
            </span>
          </div>
        </div>
        {user.institution && (
          <p className="text-xs font-body text-ink-500 mt-2 px-1 truncate">
            🏛 {user.institution.name}
          </p>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "sidebar-link",
              pathname === item.href || pathname.startsWith(item.href + "/") ? "active" : ""
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-ink-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-ink-100 min-h-screen fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-ink-100 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-navy-950">EduShare</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-ink-100">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
