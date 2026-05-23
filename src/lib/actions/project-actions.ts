"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  WorkType, ProjectStatus, Priority, ReviewStatus,
} from "@prisma/client";

// ── Enum mappers ────────────────────────────────────────────────────────────
const workTypeMap: Record<string, WorkType> = {
  Website: "WEBSITE", Logo: "LOGO", Poster: "POSTER",
  Branding: "BRANDING", "Web App": "WEB_APP", SEO: "SEO", Maintenance: "MAINTENANCE",
};
const statusMap: Record<string, ProjectStatus> = {
  New: "NEW", Planning: "PLANNING", Designing: "DESIGNING",
  Development: "DEVELOPMENT", Review: "REVIEW", Revision: "REVISION",
  Completed: "COMPLETED", Delivered: "DELIVERED",
};
const priorityMap: Record<string, Priority> = {
  Low: "LOW", Medium: "MEDIUM", High: "HIGH", Urgent: "URGENT",
};
const reviewMap: Record<string, ReviewStatus> = {
  "Pending review": "PENDING_REVIEW", "Client reviewing": "CLIENT_REVIEWING",
  Approved: "APPROVED", "Changes requested": "CHANGES_REQUESTED",
};

function toWorkType(v: string): WorkType { return workTypeMap[v] ?? "WEBSITE"; }
function toStatus(v: string): ProjectStatus { return statusMap[v] ?? "NEW"; }
function toPriority(v: string): Priority { return priorityMap[v] ?? "MEDIUM"; }
function toReview(v: string): ReviewStatus { return reviewMap[v] ?? "PENDING_REVIEW"; }

export async function getProjects() {
  const list = await prisma.project.findMany({
    where: { archived: false },
    include: { client: true, assignedEmployee: true, payments: { include: { history: true } } },
    orderBy: { createdAt: "desc" },
  });
  return list.map((p) => ({
    ...p,
    payments: p.payments.map((pay) => ({
      ...pay,
      totalPayment: Number(pay.totalPayment),
      advancePayment: Number(pay.advancePayment),
      amountPaid: Number(pay.amountPaid),
      expenses: Number(pay.expenses),
      employeeSalary: Number((pay as any).employeeSalary),
      history: pay.history.map((h) => ({
        ...h,
        amount: Number(h.amount),
      })),
    })),
  }));
}

export async function getArchivedProjects() {
  return prisma.project.findMany({
    where: { archived: true },
    include: { client: true, assignedEmployee: true },
    orderBy: { updatedAt: "desc" },
  });
}

// ── Create ──────────────────────────────────────────────────────────────────
export async function createProject(data: {
  clientId: string;
  assignedEmployeeId: string;
  name: string;
  workType: string;
  status: string;
  priority: string;
  reviewStatus: string;
  startDate: string;
  deadline: string;
  notes: string;
  taskCompletion: number;
  instagramPostCompleted: boolean;
  instagramStoryCompleted: boolean;
  deliveryCompleted: boolean;
  websiteUrl?: string;
  renewalDate?: string;
}) {
  let employeeId = data.assignedEmployeeId;
  if (!employeeId) {
    const fallbackUser = await prisma.user.findFirst({
      where: { email: "abhin@madewebs.local" },
    }) || await prisma.user.findFirst();
    if (!fallbackUser) {
      throw new Error("No team member found in database to assign the project to.");
    }
    employeeId = fallbackUser.id;
  }

  const project = await prisma.project.create({
    data: {
      clientId: data.clientId,
      assignedEmployeeId: employeeId,
      name: data.name,
      workType: toWorkType(data.workType),
      status: toStatus(data.status),
      priority: toPriority(data.priority),
      reviewStatus: toReview(data.reviewStatus),
      startDate: new Date(data.startDate),
      deadline: new Date(data.deadline),
      notes: data.notes,
      taskCompletion: data.taskCompletion,
      instagramPostCompleted: data.instagramPostCompleted,
      instagramStoryCompleted: data.instagramStoryCompleted,
      deliveryCompleted: data.deliveryCompleted,
      websiteUrl: data.websiteUrl || null,
      renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
  return project;
}

// ── Update ──────────────────────────────────────────────────────────────────
export async function updateProject(id: string, data: {
  name?: string;
  workType?: string;
  status?: string;
  priority?: string;
  reviewStatus?: string;
  startDate?: string;
  deadline?: string;
  notes?: string;
  taskCompletion?: number;
  instagramPostCompleted?: boolean;
  instagramStoryCompleted?: boolean;
  deliveryCompleted?: boolean;
  assignedEmployeeId?: string;
  clientId?: string;
  totalPayment?: number;
  advancePayment?: number;
  websiteUrl?: string | null;
  renewalDate?: string | null;
}) {
  let employeeId = data.assignedEmployeeId;
  if (employeeId === "") {
    const fallbackUser = await prisma.user.findFirst({
      where: { email: "abhin@madewebs.local" },
    }) || await prisma.user.findFirst();
    employeeId = fallbackUser?.id;
  }

  await prisma.project.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.workType && { workType: toWorkType(data.workType) }),
      ...(data.status && { status: toStatus(data.status) }),
      ...(data.priority && { priority: toPriority(data.priority) }),
      ...(data.reviewStatus && { reviewStatus: toReview(data.reviewStatus) }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.taskCompletion !== undefined && { taskCompletion: data.taskCompletion }),
      ...(data.instagramPostCompleted !== undefined && { instagramPostCompleted: data.instagramPostCompleted }),
      ...(data.instagramStoryCompleted !== undefined && { instagramStoryCompleted: data.instagramStoryCompleted }),
      ...(data.deliveryCompleted !== undefined && { deliveryCompleted: data.deliveryCompleted }),
      ...(employeeId && { assignedEmployeeId: employeeId }),
      ...(data.clientId && { clientId: data.clientId }),
      ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
      ...(data.renewalDate !== undefined && { renewalDate: data.renewalDate ? new Date(data.renewalDate) : null }),
    },
  });

  if (data.totalPayment !== undefined || data.advancePayment !== undefined) {
    const payment = await prisma.payment.findFirst({
      where: { projectId: id },
      include: { history: true },
    });

    if (payment) {
      const originalTotal = Number(payment.totalPayment);
      const originalAdvance = Number(payment.advancePayment);

      const totalPayment = data.totalPayment !== undefined ? data.totalPayment : originalTotal;
      const advancePayment = data.advancePayment !== undefined ? data.advancePayment : originalAdvance;

      const diffAdvance = advancePayment - originalAdvance;
      const newAmountPaid = Number(payment.amountPaid) + diffAdvance;

      const newStatus =
        newAmountPaid >= totalPayment ? "PAID"
        : newAmountPaid > 0 ? "PARTIAL"
        : "PENDING";

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          totalPayment,
          advancePayment,
          amountPaid: newAmountPaid,
          status: newStatus,
        },
      });

      const advanceHistory = payment.history.find((h) => h.note === "Advance payment");
      if (advanceHistory) {
        await prisma.paymentHistory.update({
          where: { id: advanceHistory.id },
          data: {
            amount: advancePayment,
          },
        });
      } else if (advancePayment > 0) {
        await prisma.paymentHistory.create({
          data: {
            paymentId: payment.id,
            amount: advancePayment,
            note: "Advance payment",
            paidAt: new Date(),
          },
        });
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/projects");
}

// ── Archive / Delete ────────────────────────────────────────────────────────
export async function archiveProject(id: string) {
  await prisma.project.update({ where: { id }, data: { archived: true } });
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function restoreProject(id: string) {
  await prisma.project.update({ where: { id }, data: { archived: false } });
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  await prisma.$transaction([
    prisma.payment.deleteMany({ where: { projectId: id } }),
    prisma.project.delete({ where: { id } }),
  ]);
  revalidatePath("/");
  revalidatePath("/projects");
}
