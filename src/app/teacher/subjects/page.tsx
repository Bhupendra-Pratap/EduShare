import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, FileText, ChevronRight, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = { title: "Subjects" };

export default async function TeacherSubjectsPage() {
  const session = await getSession();
  if (!session || session.verificationStatus !== "APPROVED") redirect("/teacher/dashboard");

  const yearGroups = await prisma.yearGroup.findMany({
    where: {
      department: { institutionId: session.institutionId || "" },
    },
    include: {
      subjects: {
        include: {
          topics: {
            include: {
              _count: { select: { notes: true } },
              notes: { where: { isVerified: false, isPublic: true }, select: { id: true } },
            },
          },
          _count: { select: { topics: true } },
        },
      },
      department: { select: { name: true } },
    },
    orderBy: { yearNumber: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Subjects</h1>
        <p className="text-sm font-body text-ink-500 mt-1">All subjects across your institution</p>
      </div>

      {yearGroups.map(yg => (
        <div key={yg.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="section-title">{yg.label}</h2>
            <span className="badge bg-ink-100 text-ink-600 text-[10px]">{yg.department.name}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {yg.subjects.map(subject => {
              const pendingCount = subject.topics.reduce((acc, t) => acc + t.notes.length, 0);
              return (
                <div key={subject.id} className="card p-5 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-body font-semibold text-ink-900">{subject.name}</h3>
                      <p className="text-xs font-body text-ink-400">{subject.code} · {subject._count.topics} topics</p>
                    </div>
                    {pendingCount > 0 && (
                      <span className="badge bg-amber-100 text-amber-700 text-[10px]">
                        {pendingCount} pending
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {subject.topics.map(topic => (
                      <Link
                        key={topic.id}
                        href={`/teacher/notes?topicId=${topic.id}`}
                        className="flex items-center justify-between p-2.5 bg-ink-50 hover:bg-ink-100 rounded-xl transition-all group"
                      >
                        <span className="text-xs font-body font-medium text-ink-700">{topic.name}</span>
                        <div className="flex items-center gap-2">
                          {topic.notes.length > 0 && (
                            <span className="badge bg-amber-100 text-amber-700 text-[10px]">
                              {topic.notes.length} to review
                            </span>
                          )}
                          <span className="text-[10px] font-body text-ink-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {topic._count.notes}
                          </span>
                          <ChevronRight className="w-3 h-3 text-ink-400 group-hover:text-ink-700" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
