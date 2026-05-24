import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function statusBadge(status: string) {
  const map: Record<string, "muted" | "success" | "warning" | "danger" | "info"> = {
    New: "info",
    Planning: "muted",
    Designing: "warning",
    Development: "info",
    Review: "warning",
    Revision: "danger",
    Completed: "success",
    Delivered: "success",
    "Pending review": "warning",
    "Client reviewing": "info",
    Approved: "success",
    "Changes requested": "danger",
    Paid: "success",
    Partial: "warning",
    Pending: "muted",
    Overdue: "danger",
    Low: "muted",
    Medium: "info",
    High: "warning",
    Urgent: "danger",
  };

  return map[status] ?? "muted";
}
