import { NextResponse } from "next/server";
import { payments } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({
    data: payments.map((payment) => ({
      ...payment,
      profit: payment.totalPayment - payment.expenses,
      pendingAmount: payment.totalPayment - payment.amountPaid,
    })),
  });
}
