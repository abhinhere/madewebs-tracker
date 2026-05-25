import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjectsWithDomains } from "@/lib/actions/domain-actions";
import { DomainsClient } from "@/components/dashboard/domains-client";

export default async function DomainsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  if (!isAdmin) {
    redirect("/");
  }

  const domainsData = await getProjectsWithDomains();
  const domains = JSON.parse(JSON.stringify(domainsData));

  return <DomainsClient domains={domains} />;
}
