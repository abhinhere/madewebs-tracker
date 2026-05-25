"use server";

import { prisma } from "@/lib/prisma";

export async function getProjectsWithDomains() {
  const list = await prisma.project.findMany({
    where: {
      archived: false,
      websiteUrl: { not: null },
      renewalDate: { not: null },
    },
    include: { client: true },
    orderBy: { renewalDate: "asc" },
  });
  return list.map((p) => ({
    ...p,
    totalAmount: Number(p.totalAmount),
    advanceAmount: Number(p.advanceAmount),
    domainCharge: Number(p.domainCharge),
    finalPaymentAmount: Number(p.finalPaymentAmount),
  }));
}
