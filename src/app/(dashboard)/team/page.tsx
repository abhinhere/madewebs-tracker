import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeamMembers } from "@/lib/actions/team-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { TeamClient } from "@/components/dashboard/team-client";

export default async function TeamPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  if (!isAdmin) {
    redirect("/");
  }

  const [members, projectsData] = await Promise.all([
    getTeamMembers(),
    getProjects(),
  ]);

  const projects = JSON.parse(JSON.stringify(projectsData));

  return <TeamClient members={members} projects={projects} />;
}
