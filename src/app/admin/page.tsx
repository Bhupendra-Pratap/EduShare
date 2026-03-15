import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StatCard } from "@/components/shared/StatCard";
import { Building2, Users, FileText, ShieldCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDate, verificationBadge, roleColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const session = await getSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";
  const whereInst = isSuperAdmin ? {} : { adminId: session?.id };

  const [institutions, totalUsers, pendingVerifications, totalNotes, recentVerifications, recentUsers] =
    await Promise.all([
      prisma.institution.count({ where: whereInst }),
      prisma.user.count({ where: isSuperAdmin ? {} : { institutionId: session?.institutionId || undefined } }),
      prisma.verificationRequest.count({
        where: {
          status: "PENDING",
          ...(isSuperAdmin ? {} : { institutionId: session?.institutionId || undefined }),
        },
      }),
      prisma.note.count(),
      prisma.verificationRequest.findMany({
        where: isSuperAdmin ? {} : { institutionId: session?.institutionId || undefined },
        include: {
          user: { select: { name: true, email: true, role: true } },
          institution: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.user.findMany({
        where: isSuperAdmin ? {} : { institutionId: session?.institutionId || undefined },
        include: { institution: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm font-body text-ink-500 mt-1">
          Welcome back, {session?.name} · {isSuperAdmin ? "Super Admin" : session?.institution?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard title="Institutions" value={institutions} icon={Building2} iconColor="bg-purple-500" />
        <StatCard title="Total Users" value={totalUsers} icon={Users} iconColor="bg-blue-500" />
        <StatCard title="Pending Verifications" value={pendingVerifications} icon={ShieldCheck} iconColor="bg-amber-500" />
        <StatCard title="Notes Shared" value={totalNotes} icon={FileText} iconColor="bg-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Verifications */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-ink-100">
            <h2 className="section-title">Recent Verification Requests</h2>
            <a href="/admin/verifications" className="text-xs font-body font-semibold text-navy-700 hover:underline">
              View all
            </a>
          </div>
          <div className="divide-y divide-ink-50">
            {recentVerifications.length === 0 ? (
              <p className="p-5 text-sm font-body text-ink-400 text-center">No pending requests</p>
            ) : recentVerifications.map((v) => {
              const badge = verificationBadge(v.status);
              return (
                <div key={v.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 bg-ink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {v.status === "APPROVED" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : v.status === "REJECTED" ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-semibold text-ink-800 truncate">{v.user.name}</p>
                    <p className="text-xs font-body text-ink-500">{v.institution.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={cn("badge text-[10px]", badge.color)}>{badge.label}</span>
                    <p className="text-[10px] font-body text-ink-400 mt-1">{formatDate(v.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-ink-100">
            <h2 className="section-title">Recent Users</h2>
            <a href="/admin/users" className="text-xs font-body font-semibold text-navy-700 hover:underline">View all</a>
          </div>
          <div className="divide-y divide-ink-50">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 bg-navy-950 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white">
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-semibold text-ink-800 truncate">{u.name}</p>
                  <p className="text-xs font-body text-ink-500 truncate">{u.email}</p>
                </div>
                <span className={cn("badge text-[10px]", roleColor(u.role))}>
                  {u.role.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
