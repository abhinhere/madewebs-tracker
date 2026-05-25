import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPayments } from "@/lib/actions/payment-actions";
import { PaymentsClient } from "@/components/dashboard/payments-client";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  if (!isAdmin) {
    redirect("/");
  }

  const paymentsData = await getPayments();
  const payments = JSON.parse(JSON.stringify(paymentsData));

  return <PaymentsClient payments={payments} />;
}
