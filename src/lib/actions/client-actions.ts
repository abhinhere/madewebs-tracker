"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

const paymentStatusMap: Record<string, PaymentStatus> = {
  Paid: "PAID", Partial: "PARTIAL", Pending: "PENDING", Overdue: "OVERDUE",
};
function toPaymentStatus(v: string): PaymentStatus { return paymentStatusMap[v] ?? "PENDING"; }

export async function getClients() {
  return prisma.client.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
  });
}

export async function getClientsWithActiveProjects() {
  return prisma.client.findMany({
    where: {
      archived: false,
      projects: {
        some: { archived: false },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createClient(data: {
  name: string; phone: string; email: string; companyName: string; paymentStatus: string;
}) {
  const newClient = await prisma.client.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, ".")}@client.local`,
      companyName: data.companyName,
      paymentStatus: toPaymentStatus(data.paymentStatus),
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
  return newClient;
}

export async function updateClient(id: string, data: {
  name?: string; phone?: string; email?: string; companyName?: string; paymentStatus?: string;
}) {
  await prisma.client.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.email && { email: data.email }),
      ...(data.companyName && { companyName: data.companyName }),
      ...(data.paymentStatus && { paymentStatus: toPaymentStatus(data.paymentStatus) }),
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function archiveClient(id: string) {
  await prisma.client.update({ where: { id }, data: { archived: true } });
  revalidatePath("/");
}

export async function restoreClient(id: string) {
  await prisma.client.update({ where: { id }, data: { archived: false } });
  revalidatePath("/");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/projects");
}
