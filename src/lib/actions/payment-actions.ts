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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    employeeSalary: Number((p as any).employeeSalary),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    employeeSalaryPaid: Boolean((p as any).employeeSalaryPaid),
    history: p.history.map((h) => ({
      ...h,
      amount: Number(h.amount),
    })),
    project: p.project ? {
      ...p.project,
      totalAmount: Number(p.project.totalAmount),
      advanceAmount: Number(p.project.advanceAmount),
      domainCharge: Number(p.project.domainCharge),
      finalPaymentAmount: Number(p.project.finalPaymentAmount),
    } : null,
  }));
}

export async function updatePaymentFinancials(id: string, data: {
  totalPayment?: number; expenses?: number; employeeSalary?: number; employeeSalaryPaid?: boolean;
}) {
  await prisma.payment.update({
    where: { id },
    data: {
      ...(data.totalPayment !== undefined && { totalPayment: data.totalPayment }),
      ...(data.expenses !== undefined && { expenses: data.expenses }),
      ...(data.employeeSalary !== undefined && { employeeSalary: data.employeeSalary }),
      ...(data.employeeSalaryPaid !== undefined && { employeeSalaryPaid: data.employeeSalaryPaid }),
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
  employeeSalary?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createData: any = {
    clientId: data.clientId,
    projectId: data.projectId,
    totalPayment: data.totalPayment,
    advancePayment: data.advancePayment,
    amountPaid: data.advancePayment,
    expenses: data.expenses,
    employeeSalary: data.employeeSalary ?? 0,
    status: data.advancePayment >= data.totalPayment ? "PAID" : data.advancePayment > 0 ? "PARTIAL" : "PENDING",
    history: data.advancePayment > 0 ? {
      create: { amount: data.advancePayment, note: "Advance payment", paidAt: new Date() }
    } : undefined,
  };

  const payment = await prisma.payment.create({
    data: createData,
  });
  revalidatePath("/");
}
