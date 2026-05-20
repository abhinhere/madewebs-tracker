import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/lib/actions/project-actions";
import { getClientsWithActiveProjects } from "@/lib/actions/client-actions";
import { getPayments } from "@/lib/actions/payment-actions";
import { DashboardOverview } from "@/components/dashboard/agency-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  const [projects, clients, payments] = await Promise.all([
    getProjects(),
    getClientsWithActiveProjects(),
    getPayments(),
  ]);

  if (!isAdmin) {
    // Filter projects to only show tasks assigned to this logged-in employee
    const myProjects = projects.filter((p) => p.assignedEmployeeId === session.user.id);
    return (
      <EmployeeDashboard
        projects={myProjects}
        employeeName={session.user.name ?? "Team Member"}
      />
    );
  }

  return (
    <DashboardOverview
      projects={projects}
      clients={clients}
      payments={payments}
    />
  );
}
