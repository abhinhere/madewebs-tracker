"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getPayments() {
  const list = await prisma.payment.findMany({
    where: {
      projectId: { not: null },
      project: { archived: false },
    },
    include: { history: true, project: true, client: true },
    orderBy: { createdAt: "desc" },
  });
  return list.map((p) => ({
    ...p,
    totalPayment: Number(p.totalPayment),
    advancePayment: Number(p.advancePayment),
    amountPaid: Number(p.amountPaid),
    expenses: Number(p.expenses),
    history: p.history.map((h) => ({
      ...h,
      amount: Number(h.amount),
    })),
  }));
}

export async function updatePaymentFinancials(id: string, data: {
  totalPayment?: number; expenses?: number;
}) {
  await prisma.payment.update({
    where: { id },
    data: {
      ...(data.totalPayment !== undefined && { totalPayment: data.totalPayment }),
      ...(data.expenses !== undefined && { expenses: data.expenses }),
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function recordPayment(paymentId: string, amount: number, note: string) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  const newAmountPaid = Number(payment.amountPaid) + amount;
  const newStatus =
    newAmountPaid >= Number(payment.totalPayment) ? "PAID"
    : newAmountPaid > 0 ? "PARTIAL"
    : "PENDING";

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      amountPaid: newAmountPaid,
      status: newStatus as "PAID" | "PARTIAL" | "PENDING" | "OVERDUE",
      history: {
        create: {
          amount,
          note: note || "Payment received",
          paidAt: new Date(),
        },
      },
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function createPaymentForProject(data: {
  clientId: string;
  projectId: string;
  totalPayment: number;
  advancePayment: number;
  expenses: number;
}) {
  await prisma.payment.create({
    data: {
      clientId: data.clientId,
      projectId: data.projectId,
      totalPayment: data.totalPayment,
      advancePayment: data.advancePayment,
      amountPaid: data.advancePayment,
      expenses: data.expenses,
      status: data.advancePayment >= data.totalPayment ? "PAID" : data.advancePayment > 0 ? "PARTIAL" : "PENDING",
      history: data.advancePayment > 0 ? {
        create: { amount: data.advancePayment, note: "Advance payment", paidAt: new Date() }
      } : undefined,
    },
  });
  revalidatePath("/");
}
