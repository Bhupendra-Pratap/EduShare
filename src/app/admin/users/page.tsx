import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate, roleColor, verificationBadge } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { UserActions } from "./UserActions";

export const metadata = { title: "Users" };

export default async function UsersPage({ searchParams }: { searchParams: { role?: string; search?: string } }) {
  const session = await getSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";
  const roleFilter = searchParams.role;
  const search = searchParams.search;

  const users = await prisma.user.findMany({
    where: {
      ...(isSuperAdmin ? {} : { institutionId: session?.institutionId || "" }),
      ...(roleFilter ? { role: roleFilter as any } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      institution: { select: { name: true } },
      department: { select: { name: true } },
      _count: { select: { notes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Users</h1>
        <p className="text-sm font-body text-ink-500 mt-1">Manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[undefined, "STUDENT", "TEACHER", "ADMIN"].map((r) => (
          <a
            key={r || "all"}
            href={r ? `/admin/users?role=${r}` : "/admin/users"}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all",
              (!r && !roleFilter) || roleFilter === r
                ? "bg-navy-950 text-white"
                : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
            )}
          >
            {r ? r.charAt(0) + r.slice(1).toLowerCase() : "All users"}
          </a>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="text-left px-5 py-3 text-xs font-body font-semibold text-ink-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-ink-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-ink-500 uppercase tracking-wide hidden md:table-cell">Institution</th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-ink-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-ink-500 uppercase tracking-wide hidden lg:table-cell">Notes</th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-ink-500 uppercase tracking-wide hidden xl:table-cell">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {users.map((u) => {
                const badge = verificationBadge(u.verificationStatus);
                return (
                  <tr key={u.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy-950 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-white">
                            {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-body font-semibold text-ink-900">{u.name}</p>
                          <p className="text-xs font-body text-ink-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("badge text-[10px]", roleColor(u.role))}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs font-body text-ink-600">{u.institution?.name || "—"}</p>
                      {u.department && <p className="text-[10px] font-body text-ink-400">{u.department.name}</p>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={cn("badge text-[10px]", badge.color)}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm font-body text-ink-600">{u._count.notes}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-xs font-body text-ink-400">{formatDate(u.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <UserActions userId={u.id} isActive={u.isActive} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
