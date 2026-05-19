import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  teamMembers as seedTeam,
  clients as seedClients,
  projects as seedProjects,
  payments as seedPayments,
  activities as seedActivities,
  type TeamMember,
  type Client,
  type Project,
  type Payment,
  type Activity,
  type ProjectStatus,
  type PaymentStatus,
} from "@/lib/seed-data";

// ── Extend types for soft-delete / archive ──────────────────────────────────
export type StoredProject = Project & { archived?: boolean; deletedAt?: string };
export type StoredClient = Client & { archived?: boolean; deletedAt?: string };
export type StoredTeamMember = TeamMember & { archived?: boolean };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Store shape ──────────────────────────────────────────────────────────────
interface AppStore {
  // Data
  projects: StoredProject[];
  clients: StoredClient[];
  teamMembers: StoredTeamMember[];
  payments: Payment[];
  activities: Activity[];

  // ── Project CRUD ────────────────────────────────────────────────────────
  addProject: (data: Omit<StoredProject, "id">) => void;
  updateProject: (id: string, patch: Partial<StoredProject>) => void;
  archiveProject: (id: string) => void;
  deleteProject: (id: string) => void;
  restoreProject: (id: string) => void;

  // ── Client CRUD ──────────────────────────────────────────────────────────
  addClient: (data: Omit<StoredClient, "id">) => void;
  updateClient: (id: string, patch: Partial<StoredClient>) => void;
  archiveClient: (id: string) => void;
  deleteClient: (id: string) => void;
  restoreClient: (id: string) => void;

  // ── Team CRUD ────────────────────────────────────────────────────────────
  addTeamMember: (data: Omit<StoredTeamMember, "id">) => void;
  updateTeamMember: (id: string, patch: Partial<StoredTeamMember>) => void;
  archiveTeamMember: (id: string) => void;
  deleteTeamMember: (id: string) => void;

  // ── Payment ──────────────────────────────────────────────────────────────
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  addPaymentHistory: (paymentId: string, entry: { amount: number; note: string; paidAt: string }) => void;

  // ── Activity log ─────────────────────────────────────────────────────────
  logActivity: (entry: Omit<Activity, "id">) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Initial seed data ────────────────────────────────────────────────
      projects: seedProjects,
      clients: seedClients,
      teamMembers: seedTeam,
      payments: seedPayments,
      activities: seedActivities,

      // ── Project actions ──────────────────────────────────────────────────
      addProject: (data) =>
        set((s) => ({
          projects: [...s.projects, { id: `pr-${uid()}`, ...data }],
        })),

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      archiveProject: (id) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, archived: true } : p,
          ),
        }));
        get().logActivity({ actor: "You", action: "archived project", project: get().projects.find((p) => p.id === id)?.projectName ?? id, time: "Just now" });
      },

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      restoreProject: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, archived: false } : p,
          ),
        })),

      // ── Client actions ───────────────────────────────────────────────────
      addClient: (data) =>
        set((s) => ({
          clients: [...s.clients, { id: `cl-${uid()}`, ...data }],
        })),

      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      archiveClient: (id) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === id ? { ...c, archived: true } : c,
          ),
        })),

      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      restoreClient: (id) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === id ? { ...c, archived: false } : c,
          ),
        })),

      // ── Team actions ─────────────────────────────────────────────────────
      addTeamMember: (data) =>
        set((s) => ({
          teamMembers: [...s.teamMembers, { id: `tm-${uid()}`, ...data }],
        })),

      updateTeamMember: (id, patch) =>
        set((s) => ({
          teamMembers: s.teamMembers.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        })),

      archiveTeamMember: (id) =>
        set((s) => ({
          teamMembers: s.teamMembers.map((m) =>
            m.id === id ? { ...m, archived: true } : m,
          ),
        })),

      deleteTeamMember: (id) =>
        set((s) => ({
          teamMembers: s.teamMembers.filter((m) => m.id !== id),
        })),

      // ── Payment actions ──────────────────────────────────────────────────
      updatePayment: (id, patch) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),

      addPaymentHistory: (paymentId, entry) =>
        set((s) => ({
          payments: s.payments.map((p) => {
            if (p.id !== paymentId) return p;
            const newAmountPaid = p.amountPaid + entry.amount;
            const newStatus: PaymentStatus =
              newAmountPaid >= p.totalPayment
                ? "Paid"
                : newAmountPaid > 0
                ? "Partial"
                : "Pending";
            return {
              ...p,
              amountPaid: newAmountPaid,
              status: newStatus,
              history: [...p.history, entry],
            };
          }),
        })),

      // ── Activity log ─────────────────────────────────────────────────────
      logActivity: (entry) =>
        set((s) => ({
          activities: [
            { id: `ac-${uid()}`, ...entry },
            ...s.activities.slice(0, 49),
          ],
        })),
    }),
    {
      name: "madewebs-tracker-store",
      version: 1,
    },
  ),
);

// ── Derived selectors ────────────────────────────────────────────────────────
export function useActiveProjects() {
  return useStore((s) => s.projects.filter((p) => !p.archived));
}

export function useArchivedProjects() {
  return useStore((s) => s.projects.filter((p) => p.archived));
}

export function useActiveClients() {
  return useStore((s) => s.clients.filter((c) => !c.archived));
}

export function useActiveTeamMembers() {
  return useStore((s) => s.teamMembers.filter((m) => !m.archived));
}
