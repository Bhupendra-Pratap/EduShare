import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { InstitutionForm } from "./InstitutionForm";
import { formatDate } from "@/lib/utils";
import { Building2, Users, CheckCircle } from "lucide-react";

export const metadata = { title: "Institutions" };

export default async function InstitutionsPage() {
  const session = await getSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const institutions = await prisma.institution.findMany({
    where: isSuperAdmin ? {} : { id: session?.institutionId || "" },
    include: {
      admin: { select: { name: true, email: true } },
      _count: { select: { users: true, departments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Institutions</h1>
          <p className="text-sm font-body text-ink-500 mt-1">
            {isSuperAdmin ? "Manage all registered institutions" : "Your institution"}
          </p>
        </div>
        {isSuperAdmin && <InstitutionForm />}
      </div>

      {institutions.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="font-body text-ink-400">No institutions yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {institutions.map((inst) => (
            <div key={inst.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-body font-semibold text-ink-900">{inst.name}</h3>
                      <p className="text-xs font-body font-bold text-ink-400 mt-0.5 uppercase tracking-wide">{inst.code}</p>
                    </div>
                    <span className={`badge text-xs ${inst.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {inst.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {inst.description && (
                    <p className="text-sm font-body text-ink-500 mt-2">{inst.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs font-body text-ink-500">
                      <Users className="w-3.5 h-3.5" />
                      {inst._count.users} users
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-body text-ink-500">
                      <Building2 className="w-3.5 h-3.5" />
                      {inst._count.departments} departments
                    </span>
                    {inst.admin && (
                      <span className="flex items-center gap-1.5 text-xs font-body text-ink-500">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Admin: {inst.admin.name}
                      </span>
                    )}
                    <span className="text-xs font-body text-ink-400 ml-auto">
                      Created {formatDate(inst.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
