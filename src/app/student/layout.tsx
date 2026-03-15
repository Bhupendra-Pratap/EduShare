import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/auth/login");
  if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/admin");
  if (user.role === "TEACHER") redirect("/teacher/dashboard");

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar user={user} panel="student" />
      <main className="lg:ml-60 min-h-screen">
        <div className="p-6 pt-16 lg:pt-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
