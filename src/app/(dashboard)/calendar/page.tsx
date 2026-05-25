import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/lib/actions/project-actions";
import { UpcomingDeadlines } from "@/components/dashboard/agency-dashboard";

export default async function CalendarPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  let projectsData = await getProjects();
  if (!isAdmin) {
    // Filter to only show projects assigned to the logged-in employee
    projectsData = projectsData.filter((p: any) => p.assignedEmployeeId === session.user.id);
  }

  const projects = JSON.parse(JSON.stringify(projectsData));

  const today = new Date();

  const upcoming = projects
    .map((p: any) => ({
      ...p,
      isOverdue: new Date(p.deadline) < today && !["COMPLETED", "DELIVERED"].includes(p.status),
    }))
    .filter((project: any) => new Date(project.deadline) >= today || project.isOverdue)
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{isAdmin ? "Agency Calendar" : "My Calendar"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin 
            ? "Overview of all agency deadlines and deliverables." 
            : "Your personal schedule and upcoming project tasks."}
        </p>
      </div>
      <UpcomingDeadlines 
        projects={upcoming} 
        title={isAdmin ? "All upcoming deadlines" : "Your assigned tasks"}
        description={isAdmin 
          ? "Calendar-aware delivery queue for all agency projects." 
          : "Delivery queue for projects assigned to you."}
      />
    </div>
  );
}
