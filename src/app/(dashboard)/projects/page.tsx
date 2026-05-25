import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/lib/actions/project-actions";
import { getClients } from "@/lib/actions/client-actions";
import { getTeamMembers } from "@/lib/actions/team-actions";
import { ProjectsClient } from "@/components/dashboard/projects-client";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  if (!isAdmin) {
    redirect("/");
  }

  const [projectsData, clientsData, teamMembers] = await Promise.all([
    getProjects(),
    getClients(),
    getTeamMembers(),
  ]);

  const projects = JSON.parse(JSON.stringify(projectsData));
  const clients = JSON.parse(JSON.stringify(clientsData));

  return <ProjectsClient projects={projects} clients={clients} teamMembers={teamMembers} />;
}
