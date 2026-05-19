import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/lib/actions/project-actions";
import { UpcomingDeadlines } from "@/components/dashboard/agency-dashboard";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  let projects = await getProjects();
  if (!isAdmin) {
    // Filter to only show projects assigned to the logged-in employee
    projects = projects.filter((p) => p.assignedEmployeeId === session.user.id);
  }

  const today = new Date();

  const upcoming = projects
    .map((p) => ({
      ...p,
      isOverdue: new Date(p.deadline) < today && !["COMPLETED", "DELIVERED"].includes(p.status),
    }))
    .filter((project) => new Date(project.deadline) >= today || project.isOverdue)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Calendar</h2>
      <UpcomingDeadlines projects={upcoming} />
    </div>
  );
}
