"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlarmClock,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Filter,
  LayoutDashboard,
  ListChecks,
  PanelsTopLeft,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModeToggle } from "@/components/mode-toggle";
import {
  activities,
  clients,
  payments,
  projects,
  revenueSeries,
  statusColumns,
  teamMembers,
  type PaymentStatus,
  type Priority,
  type ProjectStatus,
  type ReviewStatus,
} from "@/lib/seed-data";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";

const today = new Date("2026-05-19T00:00:00");

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: PanelsTopLeft },
  { label: "Team", icon: Users },
  { label: "Calendar", icon: CalendarDays },
  { label: "Reports", icon: Activity },
];

function statusBadge(status: ProjectStatus | ReviewStatus | PaymentStatus | Priority) {
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

export function AgencyDashboard() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [employee, setEmployee] = useState("All");
  const [workType, setWorkType] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");

  const enrichedProjects = useMemo(
    () =>
      projects.map((project) => {
        const payment = payments.find((item) => item.projectId === project.id);
        return {
          ...project,
          paymentStatus: payment?.status ?? "Pending",
          totalPayment: payment?.totalPayment ?? 0,
          pendingAmount: payment ? payment.totalPayment - payment.amountPaid : 0,
          profit: payment ? payment.totalPayment - payment.expenses : 0,
          isOverdue: new Date(project.deadline) < today && !["Completed", "Delivered"].includes(project.status),
        };
      }),
    [],
  );

  const filteredProjects = enrichedProjects.filter((project) => {
    const haystack = `${project.clientName} ${project.projectName} ${project.assignedEmployee}`.toLowerCase();
    return (
      haystack.includes(query.toLowerCase()) &&
      (status === "All" || project.status === status) &&
      (employee === "All" || project.assignedEmployee === employee) &&
      (workType === "All" || project.workType === workType) &&
      (paymentStatus === "All" || project.paymentStatus === paymentStatus)
    );
  });

  const metrics = {
    activeProjects: projects.filter((project) => !["Completed", "Delivered"].includes(project.status)).length,
    pendingReviews: projects.filter((project) => project.reviewStatus !== "Approved").length,
    monthlyRevenue: payments.reduce((total, payment) => total + payment.amountPaid, 0),
    pendingPayments: payments.reduce((total, payment) => total + Math.max(0, payment.totalPayment - payment.amountPaid), 0),
  };

  const upcoming = enrichedProjects
    .filter((project) => new Date(project.deadline) >= today || project.isOverdue)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar p-4 lg:block">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">MadeWebs Tracker</p>
            <p className="text-xs text-muted-foreground">Agency OS</p>
          </div>
        </div>
        <nav className="mt-6 space-y-1">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                index === 0 && "bg-accent text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border bg-background p-3">
          <p className="text-xs font-medium text-muted-foreground">Demo login</p>
          <p className="mt-1 text-sm font-medium">abhin@madewebs.local</p>
          <p className="text-xs text-muted-foreground">Password: madewebs123</p>
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 lg:px-7">
            <div className="lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold">MadeWebs Tracker</h1>
              <p className="truncate text-sm text-muted-foreground">Projects, payments, reviews, and team delivery in one workspace.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { window.location.href = "/api/reports/export"; }}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New project
            </Button>
            <ModeToggle />
          </div>
        </header>

        <div className="space-y-6 px-4 py-6 lg:px-7">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Active projects" value={String(metrics.activeProjects)} helper="In planning, design, build, or review" icon={PanelsTopLeft} />
            <MetricCard title="Pending reviews" value={String(metrics.pendingReviews)} helper="Internal or client review needed" icon={ListChecks} />
            <MetricCard title="Monthly revenue" value={formatCurrency(metrics.monthlyRevenue)} helper="Collected from active accounts" icon={CircleDollarSign} />
            <MetricCard title="Pending payments" value={formatCurrency(metrics.pendingPayments)} helper="Open invoices and balances" icon={AlarmClock} tone="warning" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <RevenueAnalytics />
            <UpcomingDeadlines projects={upcoming} />
          </section>

          <Filters
            query={query}
            status={status}
            employee={employee}
            workType={workType}
            paymentStatus={paymentStatus}
            setQuery={setQuery}
            setStatus={setStatus}
            setEmployee={setEmployee}
            setWorkType={setWorkType}
            setPaymentStatus={setPaymentStatus}
          />

          <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <ProjectTable projects={filteredProjects} />
            <TeamWorkload />
          </section>

          <KanbanBoard />

          <section className="grid gap-4 xl:grid-cols-3">
            <PaymentTracker />
            <ClientManagement />
            <ActivityAndNotifications />
          </section>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof Activity;
  tone?: "default" | "warning";
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-muted-foreground">{title}</CardTitle>
          <div className={cn("rounded-md border border-border p-2", tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300")}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{value}</div>
          <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RevenueAnalytics() {
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Revenue analytics</CardTitle>
            <CardDescription>Revenue and profit trend from agency projects.</CardDescription>
          </div>
          <Badge variant="success">+18.4%</Badge>
        </div>
      </CardHeader>
      <CardContent className="h-72">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-hsl))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground-hsl))", fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border-hsl))", background: "hsl(var(--card-hsl))" }} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="url(#revenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#profit)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-md bg-muted" />
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingDeadlines({ projects: upcomingProjects }: { projects: Array<(typeof projects)[number] & { isOverdue?: boolean }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming deadlines</CardTitle>
        <CardDescription>Calendar-aware delivery queue with overdue highlighting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingProjects.map((project) => (
          <div key={project.id} className={cn("flex items-center gap-3 rounded-md border border-border p-3", project.isOverdue && "border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30")}>
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-secondary text-xs font-medium">
              <span>{new Date(project.deadline).toLocaleString("en-IN", { month: "short" })}</span>
              <span className="text-sm text-foreground">{new Date(project.deadline).getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{project.projectName}</p>
              <p className="truncate text-xs text-muted-foreground">{project.assignedEmployee} · {project.clientName}</p>
            </div>
            <Badge variant={project.isOverdue ? "danger" : statusBadge(project.priority)}>{project.isOverdue ? "Overdue" : project.priority}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Filters({
  query,
  status,
  employee,
  workType,
  paymentStatus,
  setQuery,
  setStatus,
  setEmployee,
  setWorkType,
  setPaymentStatus,
}: {
  query: string;
  status: string;
  employee: string;
  workType: string;
  paymentStatus: string;
  setQuery: (value: string) => void;
  setStatus: (value: string) => void;
  setEmployee: (value: string) => void;
  setWorkType: (value: string) => void;
  setPaymentStatus: (value: string) => void;
}) {
  const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search projects, clients, or team" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select className={selectClass} value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          {["All", ...statusColumns].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className={selectClass} value={employee} onChange={(event) => setEmployee(event.target.value)} aria-label="Filter by employee">
          {["All", ...teamMembers.map((member) => member.name)].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className={selectClass} value={workType} onChange={(event) => setWorkType(event.target.value)} aria-label="Filter by work type">
          {["All", "Website", "Logo", "Poster", "Branding", "Web App", "SEO", "Maintenance"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className={selectClass} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} aria-label="Filter by payment status">
          {["All", "Paid", "Partial", "Pending", "Overdue"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <Button variant="outline" size="icon" title="Filters">
        <Filter className="h-4 w-4" />
      </Button>
    </section>
  );
}

function ProjectTable({ projects: tableProjects }: { projects: Array<(typeof projects)[number] & { paymentStatus: PaymentStatus; pendingAmount: number; isOverdue: boolean }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project management</CardTitle>
        <CardDescription>Status, owner, review, payment, and delivery tracking.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Social</TableHead>
              <TableHead className="text-right">Pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableProjects.map((project) => (
              <TableRow key={project.id} className={project.isOverdue ? "bg-red-50/60 dark:bg-red-950/20" : undefined}>
                <TableCell>
                  <div className="min-w-48">
                    <p className="font-medium">{project.projectName}</p>
                    <p className="text-xs text-muted-foreground">{project.clientName} · {project.workType}</p>
                  </div>
                </TableCell>
                <TableCell>{project.assignedEmployee}</TableCell>
                <TableCell><Badge variant={statusBadge(project.status)}>{project.status}</Badge></TableCell>
                <TableCell><Badge variant={statusBadge(project.reviewStatus)}>{project.reviewStatus}</Badge></TableCell>
                <TableCell>
                  <span className={cn(project.isOverdue && "font-medium text-red-600 dark:text-red-400")}>{formatDate(project.deadline)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <CheckMark active={project.instagramPostCompleted} label="Post" />
                    <CheckMark active={project.instagramStoryCompleted} label="Story" />
                    <CheckMark active={project.deliveryCompleted} label="Delivery" />
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(project.pendingAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CheckMark({ active, label }: { active: boolean; label: string }) {
  return (
    <span title={label} className={cn("flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground", active && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300")}>
      <CheckCircle2 className="h-3.5 w-3.5" />
    </span>
  );
}

function TeamWorkload() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team workload</CardTitle>
        <CardDescription>Assigned project load and task completion.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.map((member) => {
          const assigned = projects.filter((project) => project.assignedEmployee === member.name);
          const load = Math.min(100, Math.round((assigned.length / member.capacity) * 100));
          const completion = assigned.length ? Math.round(assigned.reduce((sum, project) => sum + project.taskCompletion, 0) / assigned.length) : 0;

          return (
            <div key={member.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-xs font-semibold">{initials(member.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.position}</p>
                </div>
                <Badge variant={load > 70 ? "warning" : "muted"}>{assigned.length}/{member.capacity}</Badge>
              </div>
              <Progress value={load} />
              <p className="text-xs text-muted-foreground">{completion}% average task completion</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function KanbanBoard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kanban board</CardTitle>
        <CardDescription>Pipeline view from new requests to delivered work.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-4 gap-3 xl:grid-cols-8">
          {statusColumns.map((column) => (
            <div key={column} className="rounded-lg border border-border bg-muted/30 p-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase text-muted-foreground">{column}</p>
                <span className="text-xs text-muted-foreground">{projects.filter((project) => project.status === column).length}</span>
              </div>
              <div className="space-y-2">
                {projects.filter((project) => project.status === column).map((project) => (
                  <div key={project.id} className="rounded-md border border-border bg-card p-3">
                    <p className="text-sm font-medium">{project.projectName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{project.assignedEmployee}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={statusBadge(project.priority)}>{project.priority}</Badge>
                      <span className="text-xs text-muted-foreground">{project.taskCompletion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentTracker() {
  const paymentRows = payments.map((payment) => ({
    ...payment,
    project: projects.find((item) => item.id === payment.projectId),
    profit: payment.totalPayment - payment.expenses,
    pending: payment.totalPayment - payment.amountPaid,
  }));

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Payment tracking</CardTitle>
        <CardDescription>Advance, expenses, profit, and pending balances.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentRows.slice(0, 5).map((payment) => (
          <div key={payment.id} className="rounded-md border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{payment.project?.projectName}</p>
                <p className="text-xs text-muted-foreground">Profit {formatCurrency(payment.profit)}</p>
              </div>
              <Badge variant={statusBadge(payment.status)}>{payment.status}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <span className="text-muted-foreground">Advance<br /><b className="text-foreground">{formatCurrency(payment.advancePayment)}</b></span>
              <span className="text-muted-foreground">Expenses<br /><b className="text-foreground">{formatCurrency(payment.expenses)}</b></span>
              <span className="text-muted-foreground">Pending<br /><b className="text-foreground">{formatCurrency(payment.pending)}</b></span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ClientManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client management</CardTitle>
        <CardDescription>Contact details, project history, and payment state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {clients.slice(0, 5).map((client) => (
          <div key={client.id} className="flex items-center gap-3 rounded-md border border-border p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold">{initials(client.name)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{client.name}</p>
              <p className="truncate text-xs text-muted-foreground">{client.companyName}</p>
              <p className="truncate text-xs text-muted-foreground">{client.phone}</p>
            </div>
            <Badge variant={statusBadge(client.paymentStatus)}>{client.paymentStatus}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ActivityAndNotifications() {
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team activity</CardTitle>
        <CardDescription>Notifications, alerts, and recent updates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm"><span className="font-medium">{activity.actor}</span> {activity.action}</p>
                <p className="truncate text-xs text-muted-foreground">{activity.project} · {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Alerts
          </div>
          {mounted ? (
            <ResponsiveContainer width="100%" height={145}>
              <BarChart data={[
                { name: "Assigned", value: 6 },
                { name: "Deadlines", value: 4 },
                { name: "Reviews", value: 5 },
                { name: "Payments", value: 3 },
              ]}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground-hsl))", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border-hsl))", background: "hsl(var(--card-hsl))" }} />
                <Bar dataKey="value" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[145px] rounded-md bg-muted" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
