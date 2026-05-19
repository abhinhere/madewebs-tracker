"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const roleMap: Record<string, Role> = {
  Admin: "ADMIN", Manager: "MANAGER", Employee: "EMPLOYEE",
};
function toRole(v: string): Role { return roleMap[v] ?? "EMPLOYEE"; }

export async function getTeamMembers() {
  return prisma.user.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
  });
}

export async function createTeamMember(data: {
  name: string; email: string; role: string; position: string; capacity: number;
}) {
  const passwordHash = await bcrypt.hash("madewebs123", 10);
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: toRole(data.role),
      position: data.position,
      capacity: data.capacity,
      passwordHash,
    },
  });
  revalidatePath("/team");
}

export async function updateTeamMember(id: string, data: {
  name?: string; email?: string; role?: string; position?: string; capacity?: number;
}) {
  await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.role && { role: toRole(data.role) }),
      ...(data.position && { position: data.position }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
    },
  });
  revalidatePath("/team");
}

export async function deleteTeamMember(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/team");
}
