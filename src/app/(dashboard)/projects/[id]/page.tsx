import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getClients } from "@/lib/actions/client-actions";
import { ProjectTracker } from "@/components/dashboard/project-tracker";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // Next.js 15 requires awaiting params
  const { id } = await params;

  if (id === "new") {
    // If it's a new project, we could render a starter page or redirect to projects
    // For now, let's redirect back to projects as creation might happen via a modal
    redirect("/projects");
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      payments: true,
      assignedEmployee: true,
    }
  });

  if (!project) {
    notFound();
  }

  // Convert decimal to numbers for client components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = project as any;
  const serializedProject = {
    ...project,
    totalAmount: Number(p.totalAmount ?? 0),
    advanceAmount: Number(p.advanceAmount ?? 0),
    domainCharge: Number(p.domainCharge ?? 0),
    finalPaymentAmount: Number(p.finalPaymentAmount ?? 0),
    payments: project.payments.map((pay) => ({
      ...pay,
      advancePayment: Number(pay.advancePayment),
      totalPayment: Number(pay.totalPayment),
      expenses: Number(pay.expenses),
      employeeSalary: Number((pay as any).employeeSalary ?? 0),
      amountPaid: Number(pay.amountPaid),
    })),
  };

  const clients = await getClients();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-3">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Link>
      </div>
      <ProjectTracker initialProject={serializedProject} clients={clients} />
    </div>
  );
}
