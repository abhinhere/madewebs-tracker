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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectModal } from "@/components/modals/project-modal";
import { PaymentModal } from "@/components/modals/payment-modal";
import { ClientModal } from "@/components/modals/client-modal";
import {
  archiveProject, deleteProject, restoreProject, updateProject,
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
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [workTypeFilter, setWorkTypeFilter] = useState("All");
  const showArchived = false;
  const [editingProject, setEditingProject] = useState<ProjectWithRelations | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [paymentProject, setPaymentProject] = useState<ProjectWithRelations | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingReviewProject, setEditingReviewProject] = useState<ProjectWithRelations | null>(null);
  const [editingWebsiteProject, setEditingWebsiteProject] = useState<ProjectWithRelations | null>(null);
  const [tempWebsiteUrl, setTempWebsiteUrl] = useState("");
  const [tempRenewalDate, setTempRenewalDate] = useState("");
  const [editingProgressProject, setEditingProgressProject] = useState<ProjectWithRelations | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
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
        <div className="relative min-w-0 flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 w-full" placeholder="Search projects, clients, or team" />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full md:w-auto">
          <select className={cn(selectClass, "w-full")} value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            {["All", ...employees].map((e) => <option key={e}>{e}</option>)}
          </select>
          <select className={cn(selectClass, "w-full")} value={workTypeFilter} onChange={(e) => setWorkTypeFilter(e.target.value)}>
            {["All", "Website", "Logo", "Poster", "Branding", "Web App", "SEO", "Maintenance"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </section>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div>
            <CardTitle>Project management</CardTitle>
            <CardDescription>{showArchived ? "Archived projects" : "Active projects"}</CardDescription>
          </div>
          {!showArchived && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
              <Button size="sm" variant="outline" className="flex-1 sm:flex-initial" onClick={() => setClientModalOpen(true)}>
                <Plus className="h-4 w-4" />New client
              </Button>
              <Button size="sm" className="flex-1 sm:flex-initial" onClick={openNew}>
                <Plus className="h-4 w-4" />New project
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Website & Renewal</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No projects found</TableCell></TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id} className={p.isOverdue ? "bg-red-50/60 dark:bg-red-950/20" : undefined}>
                  <TableCell>
                    <div className="min-w-48">
                      <p className="font-medium">{p.name}</p>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingClient(p.client)}
                          className="hover:text-foreground underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors font-medium text-left cursor-pointer"
                        >
                          {p.client.name}
                        </button>
                        <span>· {labelWorkType(p.workType)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.assignedEmployee.name}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setEditingReviewProject(p)}
                      className="focus:outline-none cursor-pointer block"
                    >
                      <Badge
                        variant={statusBadge(labelReviewStatus(p.reviewStatus))}
                        className="hover:opacity-80 transition-opacity"
                      >
                        {labelReviewStatus(p.reviewStatus)}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    {labelWorkType(p.workType) === "Website" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWebsiteProject(p);
                          setTempWebsiteUrl(p.websiteUrl ?? "");
                          setTempRenewalDate(p.renewalDate ? new Date(p.renewalDate).toISOString().slice(0, 10) : "");
                        }}
                        className="text-xs text-left hover:text-foreground cursor-pointer focus:outline-none block"
                      >
                        {p.websiteUrl || p.renewalDate ? (
                          <div className="space-y-0.5 min-w-[120px]">
                            {p.websiteUrl && (
                              <div className="font-medium text-primary hover:underline flex items-center gap-1">
                                <span>{p.websiteUrl}</span>
                              </div>
                            )}
                            {p.renewalDate && (
                              <div className="text-muted-foreground text-[10px]">
                                Renewal: {formatDate(new Date(p.renewalDate).toISOString())}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/45 px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent/40 transition-colors">
                            + Add URL / Renewal
                          </span>
                        )}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn(p.isOverdue && "font-medium text-red-600 dark:text-red-400")}>{formatDate(p.deadline.toISOString())}</span>
                  </TableCell>
                   <TableCell>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProgressProject(p);
                        setTempProgress(p.taskCompletion);
                      }}
                      className="flex items-center gap-2 min-w-24 w-full hover:opacity-85 transition-opacity text-left cursor-pointer focus:outline-none"
                    >
                      <Progress value={p.taskCompletion} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground font-medium hover:text-foreground transition-colors">{p.taskCompletion}%</span>
                    </button>
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
      <ClientModal
        open={clientModalOpen || !!editingClient}
        onClose={() => {
          setClientModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
      />

      {/* Website & Renewal Edit Modal */}
      <Dialog
        open={!!editingWebsiteProject}
        onClose={() => setEditingWebsiteProject(null)}
        className="max-w-sm"
      >
        <DialogHeader onClose={() => setEditingWebsiteProject(null)}>
          <DialogTitle>Website & Renewal Info</DialogTitle>
          <DialogDescription>
            {editingWebsiteProject ? `Update details for "${editingWebsiteProject.name}"` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="web-url-input">Website URL</Label>
            <Input
              id="web-url-input"
              type="text"
              placeholder="e.g. example.com"
              value={tempWebsiteUrl}
              onChange={(e) => setTempWebsiteUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renewal-date-input">Domain Renewal Date</Label>
            <Input
              id="renewal-date-input"
              type="date"
              value={tempRenewalDate}
              onChange={(e) => setTempRenewalDate(e.target.value)}
              className="w-full"
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingWebsiteProject(null)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => {
              if (!editingWebsiteProject) return;
              startTransition(async () => {
                await updateProject(editingWebsiteProject.id, {
                  websiteUrl: tempWebsiteUrl || null,
                  renewalDate: tempRenewalDate || null,
                });
                setEditingWebsiteProject(null);
                router.refresh();
              });
            }}
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Review Status Edit Modal */}
      <Dialog
        open={!!editingReviewProject}
        onClose={() => setEditingReviewProject(null)}
        className="max-w-xs"
      >
        <DialogHeader onClose={() => setEditingReviewProject(null)}>
          <DialogTitle>Update Review Status</DialogTitle>
          <DialogDescription>
            {editingReviewProject ? `Select status for "${editingReviewProject.name}"` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-1 px-6 py-4">
          {(["Pending review", "Client reviewing", "Approved", "Changes requested"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                if (!editingReviewProject) return;
                startTransition(async () => {
                  await updateProject(editingReviewProject.id, { reviewStatus: status });
                  setEditingReviewProject(null);
                  router.refresh();
                });
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
                editingReviewProject && labelReviewStatus(editingReviewProject.reviewStatus) === status
                  ? "bg-accent font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span>{status}</span>
              {editingReviewProject && labelReviewStatus(editingReviewProject.reviewStatus) === status && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              )}
            </button>
          ))}
        </DialogBody>
      </Dialog>

      {/* Progress Edit Modal */}
      <Dialog
        open={!!editingProgressProject}
        onClose={() => setEditingProgressProject(null)}
        className="max-w-sm"
      >
        <DialogHeader onClose={() => setEditingProgressProject(null)}>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            {editingProgressProject ? `Adjust task completion for "${editingProgressProject.name}"` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6 py-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-4xl font-extrabold text-primary animate-in zoom-in-50 duration-200">
              {tempProgress}%
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Completion Rate
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-medium w-6 text-right">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={tempProgress}
                onChange={(e) => setTempProgress(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg bg-secondary appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-xs text-muted-foreground font-medium w-8">100%</span>
            </div>

            <div className="flex justify-center items-center gap-2">
              <Label htmlFor="progress-number-input" className="text-xs text-muted-foreground">Or enter precise %:</Label>
              <div className="relative w-20">
                <Input
                  id="progress-number-input"
                  type="number"
                  min="0"
                  max="100"
                  value={tempProgress}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val < 0) val = 0;
                    if (val > 100) val = 100;
                    setTempProgress(val);
                  }}
                  className="h-8 text-center font-semibold text-sm pr-6"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-muted-foreground font-semibold">%</span>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingProgressProject(null)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => {
              if (!editingProgressProject) return;
              startTransition(async () => {
                await updateProject(editingProgressProject.id, {
                  taskCompletion: tempProgress,
                });
                setEditingProgressProject(null);
                router.refresh();
              });
            }}
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </Dialog>
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
