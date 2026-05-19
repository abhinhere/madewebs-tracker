"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArchiveRestore, CheckCircle2, Edit, Filter, Plus, Search, Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectModal } from "@/components/modals/project-modal";
import { PaymentModal } from "@/components/modals/payment-modal";
import {
  archiveProject, deleteProject, restoreProject,
} from "@/lib/actions/project-actions";
import type { ProjectWithRelations, PaymentWithRelations } from "@/types/db";
import type { Client, User } from "@prisma/client";
import {
  labelStatus, labelPriority, labelWorkType, labelReviewStatus,
  labelPaymentStatus,
} from "@/types/db";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";
import { statusBadge } from "@/components/dashboard/agency-dashboard";

const statusColumns = ["New", "Planning", "Designing", "Development", "Review", "Revision", "Completed", "Delivered"];

interface Props {
  projects: ProjectWithRelations[];
  clients: Client[];
  teamMembers: User[];
}

export function ProjectsClient({ projects, clients, teamMembers }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [workTypeFilter, setWorkTypeFilter] = useState("All");
  const showArchived = false;
  const [editingProject, setEditingProject] = useState<ProjectWithRelations | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [paymentProject, setPaymentProject] = useState<ProjectWithRelations | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setEditingProject(null);
      setProjectModalOpen(true);
      router.replace("/projects");
    }
  }, [searchParams, router]);

  const today = new Date();

  const enriched = useMemo(() =>
    projects.map((p) => ({
      ...p,
      isOverdue: new Date(p.deadline) < today && !["COMPLETED", "DELIVERED"].includes(p.status),
      paymentStatus: p.payments[0]?.status ?? "PENDING",
      pendingAmount: p.payments[0]
        ? Number(p.payments[0].totalPayment) - Number(p.payments[0].amountPaid)
        : 0,
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [projects]);

  const filtered = enriched.filter((p) => {
    if (showArchived !== p.archived) return false;
    const hay = `${p.client.name} ${p.name} ${p.assignedEmployee.name ?? ""}`.toLowerCase();
    const uiStatus = labelStatus(p.status);
    const uiWork = labelWorkType(p.workType);
    return (
      hay.includes(query.toLowerCase()) &&
      (statusFilter === "All" || uiStatus === statusFilter) &&
      (employeeFilter === "All" || p.assignedEmployee.name === employeeFilter) &&
      (workTypeFilter === "All" || uiWork === workTypeFilter)
    );
  });

  const employees = [...new Set(projects.map((p) => p.assignedEmployee.name ?? ""))].filter(Boolean);

  const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  function openNew() { setEditingProject(null); setProjectModalOpen(true); }
  function openEdit(p: ProjectWithRelations) { setEditingProject(p); setProjectModalOpen(true); }

  function handleArchive(id: string) {
    startTransition(() => { archiveProject(id); });
  }
  function handleRestore(id: string) {
    startTransition(() => { restoreProject(id); });
  }
  function handleDelete(id: string) {
    if (!confirm("Permanently delete this project? This cannot be undone.")) return;
    startTransition(() => { deleteProject(id); });
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" placeholder="Search projects, clients, or team" />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {["All", ...statusColumns].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className={selectClass} value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            {["All", ...employees].map((e) => <option key={e}>{e}</option>)}
          </select>
          <select className={selectClass} value={workTypeFilter} onChange={(e) => setWorkTypeFilter(e.target.value)}>
            {["All", "Website", "Logo", "Poster", "Branding", "Web App", "SEO", "Maintenance"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4" />New project</Button>
      </section>

      {/* Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Project management</CardTitle>
            <CardDescription>{showArchived ? "Archived projects" : "Active projects"}</CardDescription>
          </div>
          {!showArchived && (
            <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" />New project</Button>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No projects found</TableCell></TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id} className={p.isOverdue ? "bg-red-50/60 dark:bg-red-950/20" : undefined}>
                  <TableCell>
                    <div className="min-w-48">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.client.name} · {labelWorkType(p.workType)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.assignedEmployee.name}</TableCell>
                  <TableCell><Badge variant={statusBadge(labelReviewStatus(p.reviewStatus))}>{labelReviewStatus(p.reviewStatus)}</Badge></TableCell>
                  <TableCell>
                    <span className={cn(p.isOverdue && "font-medium text-red-600 dark:text-red-400")}>{formatDate(p.deadline.toISOString())}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-24">
                      <Progress value={p.taskCompletion} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{p.taskCompletion}%</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <button
                      className="text-sm hover:underline"
                      onClick={() => setPaymentProject(p)}
                    >
                      {formatCurrency(p.pendingAmount)}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button onClick={() => handleDelete(p.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kanban */}
      <Card>
        <CardHeader>
          <CardTitle>Kanban board</CardTitle>
          <CardDescription>Pipeline view — click a card to edit.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-4 gap-3 xl:grid-cols-8">
            {statusColumns.map((col) => {
              const colProjects = enriched.filter((p) => !p.archived && labelStatus(p.status) === col);
              return (
                <div key={col} className="rounded-lg border border-border bg-muted/30 p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase text-muted-foreground">{col}</p>
                    <span className="text-xs text-muted-foreground">{colProjects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colProjects.map((p) => (
                      <motion.div
                        key={p.id}
                        className="cursor-pointer rounded-md border border-border bg-card p-3 hover:border-foreground/20"
                        onClick={() => openEdit(p)}
                        whileHover={{ scale: 1.01 }}
                      >
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.assignedEmployee.name}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant={statusBadge(labelPriority(p.priority))}>{labelPriority(p.priority)}</Badge>
                          <span className="text-xs text-muted-foreground">{p.taskCompletion}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={editingProject}
        clients={clients}
        teamMembers={teamMembers}
      />
      <PaymentModal
        open={!!paymentProject}
        onClose={() => setPaymentProject(null)}
        payment={paymentProject?.payments[0] ?? null}
        projectName={paymentProject?.name}
      />
    </div>
  );
}

function CheckIcon({ active, label }: { active: boolean; label: string }) {
  return (
    <span title={label} className={cn("flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground", active && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300")}>
      <CheckCircle2 className="h-3.5 w-3.5" />
    </span>
  );
}
