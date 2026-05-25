"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { updateProject } from "@/lib/actions/project-actions";
import { formatDate, formatCurrency, statusBadge } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectWithRelations } from "@/types/db";
import { Dialog } from "@/components/ui/dialog";
import { ProjectTracker } from "./project-tracker";

interface Props {
  projects: ProjectWithRelations[];
  employeeName: string;
}

export function EmployeeDashboard({ projects, employeeName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [openTrackerId, setOpenTrackerId] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => !["COMPLETED", "DELIVERED"].includes(p.status));
  const completedProjects = projects.filter((p) => ["COMPLETED", "DELIVERED"].includes(p.status));
  
  const totalEarnings = projects.reduce((sum, p) => sum + (p.payments[0] ? Number(p.payments[0].employeeSalary || 0) : 0), 0);

  function toggleDeliverable(projectId: string, field: "instagramPostCompleted" | "instagramStoryCompleted" | "deliveryCompleted", currentVal: boolean) {
    startTransition(async () => {
      await updateProject(projectId, { [field]: !currentVal });
    });
  }

  function advanceStatus(projectId: string, currentStatus: string, workType: string) {
    let nextStatus = "Planning";
    let nextCompletion = 25;

    if (workType === "WEBSITE") {
      if (currentStatus === "NEW") { nextStatus = "Planning"; nextCompletion = 10; }
      else if (currentStatus === "PLANNING") { nextStatus = "Repo"; nextCompletion = 20; }
      else if (currentStatus === "REPO") { nextStatus = "Developing"; nextCompletion = 30; }
      else if (currentStatus === "DEVELOPING" || currentStatus === "DEVELOPMENT") { nextStatus = "Pushed"; nextCompletion = 40; }
      else if (currentStatus === "PUSHED") { nextStatus = "Deployed"; nextCompletion = 50; }
      else if (currentStatus === "DEPLOYED") { nextStatus = "Review"; nextCompletion = 60; }
      else if (currentStatus === "REVIEW") { nextStatus = "Final changes"; nextCompletion = 70; }
      else if (currentStatus === "FINAL_CHANGES" || currentStatus === "REVISION") { nextStatus = "Domain connection"; nextCompletion = 80; }
      else if (currentStatus === "DOMAIN_CONNECTION") { nextStatus = "Tested"; nextCompletion = 90; }
      else if (currentStatus === "TESTED") { nextStatus = "Completed"; nextCompletion = 100; }
      else { nextStatus = "Completed"; nextCompletion = 100; }
    } else {
      if (currentStatus === "NEW") {
        nextStatus = "Planning";
        nextCompletion = 20;
      } else if (currentStatus === "PLANNING") {
        nextStatus = "Designing";
        nextCompletion = 40;
      } else if (currentStatus === "DESIGNING") {
        nextStatus = "Development";
        nextCompletion = 65;
      } else if (currentStatus === "DEVELOPMENT") {
        nextStatus = "Review";
        nextCompletion = 85;
      } else if (currentStatus === "REVIEW" || currentStatus === "REVISION") {
        nextStatus = "Completed";
        nextCompletion = 100;
      }
    }

    startTransition(async () => {
      await updateProject(projectId, {
        status: nextStatus,
        taskCompletion: nextCompletion,
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* Employee Greeting Header */}
      <Card className="border border-border/80 bg-gradient-to-r from-sky-50/50 to-indigo-50/50 dark:from-sky-950/20 dark:to-indigo-950/20">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="MadeWebs" width={24} height={24} className="object-contain animate-pulse" />
              <CardTitle className="text-lg sm:text-xl font-bold tracking-tight">Welcome back, {employeeName}!</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Here is your personal developer workspace. Keep track of deadlines and toggle assigned deliverables.
            </CardDescription>
          </div>
          <Badge variant="info" className="px-2.5 py-1 text-xs self-start sm:self-auto">Employee Session</Badge>
        </CardHeader>
      </Card>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-4 overflow-x-auto">
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground leading-tight">My active tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-base font-bold text-sky-600">{activeProjects.length}</div>
            <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Pending development & delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground leading-tight">Completed deliverables</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-base font-bold text-emerald-600">{completedProjects.length}</div>
            <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Archived or finalized projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground leading-tight">My earnings</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-base font-bold text-indigo-600">{formatCurrency(totalEarnings)}</div>
            <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Total from assigned projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground leading-tight">Nearest deadline</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
              <Clock className="h-3 w-3 text-amber-500 shrink-0" />
              <span>
                {activeProjects.length > 0 ? (
                  formatDate(new Date(Math.min(...activeProjects.map((p) => new Date(p.deadline).getTime()))))
                ) : (
                  <span className="text-muted-foreground">No pending deadlines</span>
                )}
              </span>
            </div>
            <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Deliverables schedule</p>
          </CardContent>
        </Card>
      </div>

      {/* My Projects Checklist Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>My assigned projects</CardTitle>
          <CardDescription>Tick off active workflow tasks and update deliverables state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeProjects.map((project) => {
            const isOverdue = new Date(project.deadline) < new Date();
            const uiStatus = project.status;

            const isPreCompletion = project.workType === "WEBSITE" 
              ? project.status === "TESTED" 
              : ["REVIEW", "REVISION"].includes(project.status as string);
              
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const requiresAdminApproval = isPreCompletion && (project as any).reviewStatus !== "APPROVED";

            return (
              <div 
                key={project.id} 
                className="rounded-lg border border-border p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => {
                  const isCompleted = uiStatus === "COMPLETED" || uiStatus === "DELIVERED";
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const hasClientChanges = (project as any).clientChanges?.trim() && !(project as any).clientApproved;
                  if (!isCompleted || hasClientChanges) {
                    setOpenTrackerId(project.id);
                  }
                }}
              >
                {/* Project Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Client: <span className="font-medium text-foreground">{project.client?.name}</span> · Type: <span className="font-medium text-foreground">{project.workType}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {project.payments[0] && Number(project.payments[0].employeeSalary) > 0 && (
                      <Badge 
                        variant="default" 
                        className={
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (project.payments[0] as any).employeeSalaryPaid
                            ? "bg-white text-emerald-700 border-emerald-200 dark:bg-zinc-950 dark:text-emerald-400 dark:border-emerald-900"
                            : "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900"
                        }
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(project.payments[0] as any).employeeSalaryPaid ? "Paid" : "Pending Payout"}: {formatCurrency(Number(project.payments[0].employeeSalary))}
                      </Badge>
                    )}
                    <Badge variant={statusBadge(uiStatus)}>{uiStatus}</Badge>
                    <Badge variant={isOverdue ? "danger" : "muted"} className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      Due {formatDate(project.deadline)}
                      {isOverdue && <AlertCircle className="h-3 w-3 shrink-0 text-red-100" />}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Task completion</span>
                    <span className="font-bold text-foreground">{project.taskCompletion}%</span>
                  </div>
                  <Progress value={project.taskCompletion} />
                </div>

                {/* Workflow actions / Status advancement */}
                <div className="rounded-md bg-muted/30 p-3 border border-border/50" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">Detailed Tracker</span>
                      {(() => {
                        const isCompleted = uiStatus === "COMPLETED" || uiStatus === "DELIVERED";
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const hasClientChanges = (project as any).clientChanges?.trim() && !(project as any).clientApproved;
                        
                        if (isCompleted && !hasClientChanges) {
                          return <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">Project completed & locked</span>;
                        }
                        
                        return (
                          <>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => setOpenTrackerId(project.id)}>
                              {hasClientChanges ? "Open Tracker (Changes Requested!)" : "Open Project Tracker"}
                            </Button>
                            <Dialog open={openTrackerId === project.id} onClose={() => setOpenTrackerId(null)}>
                              <ProjectTracker initialProject={project} role="EMPLOYEE" onClose={() => setOpenTrackerId(null)} />
                            </Dialog>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Website Deployed Link Input */}
                {project.workType === "WEBSITE" && (
                  <div className="rounded-md bg-muted/20 p-3 border border-border/50" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Deployed Link</p>
                    <form 
                      action={async (formData) => {
                        const url = formData.get('url') as string;
                        startTransition(async () => {
                          await updateProject(project.id, { deployedUrl: url });
                        });
                      }} 
                      className="flex items-center gap-2"
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Input name="url" defaultValue={(project as any).deployedUrl ?? ""} placeholder="https://..." className="h-8 text-xs" />
                      <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs shrink-0" disabled={isPending}>
                        {isPending ? "..." : "Save Link"}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Notes if any */}
                {project.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/10 rounded p-2.5 border border-border/40 flex items-start gap-2">
                    <FileText className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="line-clamp-2">{project.notes}</p>
                  </div>
                )}
              </div>
            );
          })}

          {activeProjects.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium text-foreground mt-3">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">You have no active projects or pending tasks assigned.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Projects Section */}
      {completedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed projects</CardTitle>
            <CardDescription>Archive of your finalized work and completed deliverables.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {completedProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div>
                    <h3 className="text-sm font-semibold">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Client: <span className="font-medium text-foreground">{project.client?.name}</span> · Type: {project.workType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.payments[0] && Number(project.payments[0].employeeSalary) > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="default" 
                          className={
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (project.payments[0] as any).employeeSalaryPaid
                              ? "bg-white text-emerald-700 border-emerald-200 dark:bg-zinc-950 dark:text-emerald-400 dark:border-emerald-900"
                              : "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900"
                          }
                        >
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(project.payments[0] as any).employeeSalaryPaid ? "Paid" : "Pending Payout"}: {formatCurrency(Number(project.payments[0].employeeSalary))}
                        </Badge>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {!(project.payments[0] as any).employeeSalaryPaid && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[10px] px-2"
                            onClick={async () => {
                              const text = `Hi Admin, just a reminder regarding my pending salary payout of ${formatCurrency(Number(project.payments[0].employeeSalary))} for the completed project: ${project.name}.`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                            }}
                          >
                            Remind Admin
                          </Button>
                        )}
                      </div>
                    )}
                    <Badge variant={statusBadge(project.status as any)}>{project.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
