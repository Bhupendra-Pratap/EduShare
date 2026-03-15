import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DepartmentManager } from "./DepartmentManager";

export const metadata = { title: "Departments & Subjects" };

export default async function DepartmentsPage() {
  const session = await getSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const institutions = await prisma.institution.findMany({
    where: isSuperAdmin ? {} : { id: session?.institutionId || "" },
    include: {
      departments: {
        include: {
          yearGroups: {
            include: {
              subjects: { include: { _count: { select: { topics: true } } } },
            },
          },
          _count: { select: { users: true } },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Departments & Subjects</h1>
        <p className="text-sm font-body text-ink-500 mt-1">
          Manage academic structure for your institutions
        </p>
      </div>
      <DepartmentManager institutions={institutions} />
    </div>
  );
}
