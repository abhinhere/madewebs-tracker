"use client";

import { useTransition } from "react";
import Image from "next/image";
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { updateProject } from "@/lib/actions/project-actions";
import { statusBadge } from "@/components/dashboard/agency-dashboard";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types/db";

interface Props {
  projects: ProjectWithRelations[];
  employeeName: string;
}

export function EmployeeDashboard({ projects, employeeName }: Props) {
  const [, startTransition] = useTransition();

  const activeProjects = projects.filter((p) => !["COMPLETED", "DELIVERED"].includes(p.status));
  const completedProjects = projects.filter((p) => ["COMPLETED", "DELIVERED"].includes(p.status));
  
  const totalEarnings = projects.reduce((sum, p) => sum + (p.payments[0] ? Number(p.payments[0].employeeSalary || 0) : 0), 0);

  function toggleDeliverable(projectId: string, field: "instagramPostCompleted" | "instagramStoryCompleted" | "deliveryCompleted", currentVal: boolean) {
    startTransition(async () => {
      await updateProject(projectId, { [field]: !currentVal });
    });
  }

  function advanceStatus(projectId: string, currentStatus: string) {
    let nextStatus = "Planning";
    let nextCompletion = 25;

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

    startTransition(async () => {
      await updateProject(projectId, {
        status: nextStatus,
        taskCompletion: nextCompletion,
      });
    });
  }

  function setProgressPercent(projectId: string, percent: number) {
    startTransition(async () => {
      await updateProject(projectId, { taskCompletion: percent });
    });
  }

  return (
    <div className="space-y-6">
      {/* Employee Greeting Header */}
      <Card className="border border-border/80 bg-gradient-to-r from-sky-50/50 to-indigo-50/50 dark:from-sky-950/20 dark:to-indigo-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="MadeWebs" width={24} height={24} className="object-contain animate-pulse" />
              <CardTitle className="text-xl font-bold tracking-tight">Welcome back, {employeeName}!</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Here is your personal developer workspace. Keep track of deadlines and toggle assigned deliverables.
            </CardDescription>
          </div>
          <Badge variant="info" className="px-2.5 py-1 text-xs">Employee Session</Badge>
        </CardHeader>
      </Card>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My active tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending development & delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed deliverables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Archived or finalized projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total from assigned projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nearest deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate flex items-center gap-1.5 text-foreground">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              {activeProjects.length > 0 ? (
                formatDate(new Date(Math.min(...activeProjects.map((p) => new Date(p.deadline).getTime()))))
              ) : (
                <span className="text-muted-foreground">No pending deadlines</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Deliverables schedule</p>
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

            return (
              <div key={project.id} className="rounded-lg border border-border p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow">
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
                      <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
                        Payout: {formatCurrency(Number(project.payments[0].employeeSalary))}
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
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                    {[0, 25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setProgressPercent(project.id, pct)}
                        className={`text-[10px] px-2 py-0.5 rounded border border-border transition-colors shrink-0 ${
                          project.taskCompletion === pct ? "bg-foreground text-background" : "bg-muted/30 hover:bg-accent text-muted-foreground"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Workflow actions / Status advancement */}
                <div className="rounded-md bg-muted/30 p-3 border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Advance Workflow State</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">Current: {uiStatus}</span>
                    {uiStatus !== "COMPLETED" && uiStatus !== "DELIVERED" ? (
                      <Button size="sm" variant="outline" onClick={() => advanceStatus(project.id, uiStatus)} className="text-xs">
                        Mark stage complete
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium">Project completed!</span>
                    )}
                  </div>
                </div>

                {/* Interactive Deliverables Checkboxes */}
                <div className="border-t border-border/60 pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Taggable Deliverables</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { key: "instagramPostCompleted" as const, label: "Instagram post" },
                      { key: "instagramStoryCompleted" as const, label: "Instagram story" },
                      { key: "deliveryCompleted" as const, label: "Delivery files" },
                    ].map(({ key, label }) => {
                      const completed = project[key];
                      return (
                        <button
                          key={key}
                          onClick={() => toggleDeliverable(project.id, key, completed)}
                          className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all ${
                            completed
                              ? "border-emerald-100 bg-emerald-50/40 text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/20"
                              : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                          )}
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
    </div>
  );
}
