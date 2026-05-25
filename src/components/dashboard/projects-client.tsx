"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2, Plus, Search, Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectModal } from "@/components/modals/project-modal";
import { PaymentModal } from "@/components/modals/payment-modal";
import { ClientModal } from "@/components/modals/client-modal";
import {
  deleteProject, updateProject,
} from "@/lib/actions/project-actions";
import type { ProjectWithRelations } from "@/types/db";
import type { Client, User } from "@prisma/client";
import {
  labelWorkType, labelReviewStatus,
} from "@/types/db";
import { cn, formatCurrency, formatDate, statusBadge } from "@/lib/utils";



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
    const uiWork = labelWorkType(p.workType);
    return (
      hay.includes(query.toLowerCase()) &&
      (employeeFilter === "All" || p.assignedEmployee.name === employeeFilter) &&
      (workTypeFilter === "All" || uiWork === workTypeFilter)
    );
  });

  const activeFiltered = filtered.filter(p => !["COMPLETED", "DELIVERED"].includes(p.status));
  const completedFiltered = filtered.filter(p => ["COMPLETED", "DELIVERED"].includes(p.status));

  const employees = [...new Set(projects.map((p) => p.assignedEmployee.name ?? ""))].filter(Boolean);

  const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  function openNew() { setEditingProject(null); setProjectModalOpen(true); }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this project? This cannot be undone.")) return;
    startTransition(() => { deleteProject(id); });
  }

  const renderProjectGrid = (projectList: typeof activeFiltered) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projectList.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground py-8">No projects found</div>
      )}
      {projectList.map((p) => (
        <div key={p.id} onClick={() => router.push(`/projects/${p.id}`)} className={cn("cursor-pointer flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md", p.isOverdue && "border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10")}>
          <div className="flex items-start justify-between p-4 border-b border-border/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <a href={`/projects/${p.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-base truncate hover:underline text-primary">
                  {p.name}
                </a>
                <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{labelWorkType(p.workType)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setEditingClient(p.client); }}
                className="text-sm text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors text-left cursor-pointer truncate max-w-full block"
              >
                {p.client.name}
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-1 ml-2">
               <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assigned</p>
                <p className="font-medium truncate">{p.assignedEmployee.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                <p className={cn("font-medium", p.isOverdue && "text-red-600 dark:text-red-400")}>
                  {formatDate(p.deadline)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Review Status</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEditingReviewProject(p); }}
                  className="focus:outline-none cursor-pointer text-left block"
                >
                  <Badge variant={statusBadge(labelReviewStatus(p.reviewStatus))} className="hover:opacity-80">
                    {labelReviewStatus(p.reviewStatus)}
                  </Badge>
                </button>
              </div>
              
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Website</p>
                {labelWorkType(p.workType) === "Website" ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingWebsiteProject(p);
                      setTempWebsiteUrl(p.websiteUrl ?? "");
                      setTempRenewalDate(p.renewalDate ? new Date(p.renewalDate).toISOString().slice(0, 10) : "");
                    }}
                    className="text-xs text-left hover:text-foreground cursor-pointer focus:outline-none block w-full"
                  >
                    {p.websiteUrl || p.renewalDate ? (
                      <div className="space-y-0.5 truncate">
                        {p.websiteUrl && <div className="font-medium text-primary hover:underline truncate">{p.websiteUrl}</div>}
                        {p.renewalDate && <div className="text-muted-foreground text-[10px]">Renews: {formatDate(new Date(p.renewalDate).toISOString())}</div>}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/45 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent/40 transition-colors">
                        + Add Details
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="text-muted-foreground/30">—</span>
                )}
              </div>
            </div>

            <div>
               <p className="text-xs text-muted-foreground mb-1">Progress</p>
               <div
                 className="flex items-center gap-2 w-full text-left"
               >
                 <Progress value={p.taskCompletion} className="h-1.5 flex-1" />
                 <span className="text-xs text-muted-foreground font-medium">{p.taskCompletion}%</span>
               </div>
            </div>
          </div>

          <div className="p-4 pt-3 border-t border-border/50 bg-muted/10 rounded-b-xl flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Payment</span>
            <button
              className="text-sm font-semibold hover:underline text-foreground"
              onClick={(e) => { e.stopPropagation(); setPaymentProject(p); }}
            >
              {formatCurrency(p.pendingAmount)}
            </button>
          </div>
        </div>
      ))}
    </div>
  );



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
              <Button size="sm" className="flex-1 sm:flex-initial" onClick={openNew}>
                <Plus className="h-4 w-4" />New project
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {renderProjectGrid(activeFiltered)}
        </CardContent>
      </Card>

      {/* Completed Projects Table */}
      {completedFiltered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed projects</CardTitle>
            <CardDescription>Approved and finalized projects</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {renderProjectGrid(completedFiltered)}
          </CardContent>
        </Card>
      )}

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
          {(
            !editingReviewProject 
              ? [] 
              : editingReviewProject.currentStep >= 9 
                ? ["Tested", "Client approved", "Approved"] 
                : ["Tested", "Client approved"]
          ).map((status) => (
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

    </div>
  );
}


