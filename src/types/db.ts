// Shared UI-friendly type aliases built from Prisma data shapes.
// Pages pass these down to Client Components so we don't import Prisma types on the client.

import type {
  Project, Client, User, Payment, PaymentHistory,
} from "@prisma/client";

export type ProjectWithRelations = Omit<Project, "totalAmount" | "advanceAmount" | "domainCharge" | "finalPaymentAmount"> & {
  totalAmount: number;
  advanceAmount: number;
  domainCharge: number;
  finalPaymentAmount: number;
  client: Client;
  assignedEmployee: User;
  payments: (Omit<Payment, "totalPayment" | "advancePayment" | "amountPaid" | "expenses" | "employeeSalary"> & {
    totalPayment: number;
    advancePayment: number;
    amountPaid: number;
    expenses: number;
    employeeSalary?: number;
    history: (Omit<PaymentHistory, "amount"> & { amount: number })[];
  })[];
};

export type PaymentWithRelations = Omit<Payment, "totalPayment" | "advancePayment" | "amountPaid" | "expenses" | "employeeSalary"> & {
  totalPayment: number;
  advancePayment: number;
  amountPaid: number;
  expenses: number;
  employeeSalary?: number;
  history: (Omit<PaymentHistory, "amount"> & { amount: number })[];
  project: (Omit<Project, "totalAmount" | "advanceAmount" | "domainCharge" | "finalPaymentAmount"> & {
    totalAmount: number;
    advanceAmount: number;
    domainCharge: number;
    finalPaymentAmount: number;
  }) | null;
  client: Client;
};

// ── Enum → UI label converters ───────────────────────────────────────────────
export function labelStatus(s: string) {
  const map: Record<string, string> = {
    NEW: "New", PLANNING: "Planning", REPO: "Repo", DESIGNING: "Designing",
    DEVELOPING: "Developing", DEVELOPMENT: "Development", PUSHED: "Pushed",
    DEPLOYED: "Deployed", REVIEW: "Review", FINAL_CHANGES: "Final changes",
    DOMAIN_CONNECTION: "Domain connection", REVISION: "Revision", TESTED: "Tested",
    COMPLETED: "Completed", DELIVERED: "Delivered",
  };
  return map[s] ?? s;
}

export function labelPriority(s: string) {
  const map: Record<string, string> = {
    LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent",
  };
  return map[s] ?? s;
}

export function labelWorkType(s: string) {
  const map: Record<string, string> = {
    WEBSITE: "Website", LOGO: "Logo", POSTER: "Poster",
    BRANDING: "Branding", WEB_APP: "Web App", SEO: "SEO", MAINTENANCE: "Maintenance",
  };
  return map[s] ?? s;
}

export function labelReviewStatus(s: string) {
  const map: Record<string, string> = {
    PENDING_REVIEW: "Pending review", CLIENT_REVIEWING: "Client reviewing",
    TESTED: "Tested",
    CLIENT_APPROVED: "Client approved", APPROVED: "Approved", CHANGES_REQUESTED: "Changes requested",
  };
  return map[s] ?? s;
}

export function labelPaymentStatus(s: string) {
  const map: Record<string, string> = {
    PAID: "Paid", PARTIAL: "Partial", PENDING: "Pending", OVERDUE: "Overdue",
  };
  return map[s] ?? s;
}

export function labelRole(s: string) {
  const map: Record<string, string> = {
    ADMIN: "Admin", MANAGER: "Manager", EMPLOYEE: "Employee",
  };
  return map[s] ?? s;
}
