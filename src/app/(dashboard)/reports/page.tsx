import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClients } from "@/lib/actions/client-actions";
import { getPayments } from "@/lib/actions/payment-actions";
import { ClientManagement, PaymentTracker, RevenueAnalytics } from "@/components/dashboard/agency-dashboard";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  if (!isAdmin) {
    redirect("/");
  }

  const [payments, clients] = await Promise.all([
    getPayments(),
    getClients(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <RevenueAnalytics payments={payments} />
        <PaymentTracker payments={payments} />
      </div>
      <ClientManagement clients={clients} />
    </div>
  );
}
