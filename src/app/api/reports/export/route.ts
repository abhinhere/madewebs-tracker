import { projects, payments } from "@/lib/seed-data";

export async function GET() {
  const rows = projects.map((project) => {
    const payment = payments.find((item) => item.projectId === project.id);
    return {
      client: project.clientName,
      project: project.projectName,
      workType: project.workType,
      assignedEmployee: project.assignedEmployee,
      status: project.status,
      priority: project.priority,
      reviewStatus: project.reviewStatus,
      deadline: project.deadline,
      totalPayment: payment?.totalPayment ?? 0,
      expenses: payment?.expenses ?? 0,
      profit: payment ? payment.totalPayment - payment.expenses : 0,
      pendingAmount: payment ? payment.totalPayment - payment.amountPaid : 0,
      paymentStatus: payment?.status ?? "Pending",
    };
  });

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header as keyof typeof row]);
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="madewebs-tracker-report.csv"',
    },
  });
}
