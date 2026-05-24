"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlarmClock,
  Bell,
  CircleDollarSign,
  ListChecks,
  PanelsTopLeft,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, initials, statusBadge } from "@/lib/utils";
import type { ProjectWithRelations, PaymentWithRelations } from "@/types/db";
import type { Client } from "@prisma/client";
import { labelPriority, labelPaymentStatus } from "@/types/db";

const today = new Date();

interface DashboardOverviewProps {
  projects: ProjectWithRelations[];
  clients: Client[];
  payments: PaymentWithRelations[];
}

export function DashboardOverview({ projects, clients, payments }: DashboardOverviewProps) {
  const enrichedProjects = useMemo(
    () =>
      projects.map((project) => {
        const payment = payments.find((item) => item.projectId === project.id);
        return {
          ...project,
          paymentStatus: payment?.status ?? "PENDING",
          totalPayment: payment ? Number(payment.totalPayment) : 0,
          pendingAmount: payment ? Number(payment.totalPayment) - Number(payment.amountPaid) : 0,
          profit: payment ? Number(payment.totalPayment) - Number(payment.expenses) - Number(payment.employeeSalary || 0) : 0,
          isOverdue: new Date(project.deadline) < today && !["COMPLETED", "DELIVERED"].includes(project.status),
        };
      }),
    [projects, payments],
  );

  const metrics = useMemo(() => {
    const active = projects.filter((project) => !["COMPLETED", "DELIVERED"].includes(project.status));
    const pendingRev = projects.filter((project) => project.reviewStatus !== "APPROVED");
    const monthlyRev = payments.reduce((total, p) => total + Number(p.amountPaid), 0);
    const pendingPay = payments.reduce((total, p) => total + Math.max(0, Number(p.totalPayment) - Number(p.amountPaid)), 0);
    const totalProf = payments.reduce((total, p) => total + (Number(p.totalPayment) - Number(p.expenses) - Number(p.employeeSalary || 0)), 0);

    return {
      activeProjects: active.length,
      pendingReviews: pendingRev.length,
      monthlyRevenue: monthlyRev,
      pendingPayments: pendingPay,
      totalProfit: totalProf,
    };
  }, [projects, payments]);

  const upcoming = useMemo(() => {
    return enrichedProjects
      .filter((project) => new Date(project.deadline) >= today || project.isOverdue)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [enrichedProjects]);

  return (
    <>
      <section className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard title="Active projects" value={String(metrics.activeProjects)} helper="In planning, design, build, or review" icon={PanelsTopLeft} />
        <MetricCard title="Pending reviews" value={String(metrics.pendingReviews)} helper="Internal or client review needed" icon={ListChecks} />
        <MetricCard title="Monthly revenue" value={formatCurrency(metrics.monthlyRevenue)} helper="Collected from active accounts" icon={CircleDollarSign} />
        <MetricCard title="Pending payments" value={formatCurrency(metrics.pendingPayments)} helper="Open invoices and balances" icon={AlarmClock} tone="warning" />
        <MetricCard title="Total profit" value={formatCurrency(metrics.totalProfit)} helper="Project value minus expenses" icon={TrendingUp} tone="success" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <RevenueAnalytics payments={payments} />
        <UpcomingDeadlines projects={upcoming} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <PaymentTracker payments={payments} />
        <ClientManagement clients={clients} />
        <ActivityAndNotifications />
      </section>
    </>
  );
}

export function MetricCard({
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
  tone?: "default" | "warning" | "success";
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-muted-foreground">{title}</CardTitle>
          <div className={cn(
            "rounded-md border border-border p-2",
            tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
            tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          )}>
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

export function RevenueAnalytics({ payments }: { payments: PaymentWithRelations[] }) {
  const mounted = useMounted();

  const chartData = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = d.toLocaleString("en-US", { month: "short" });
      const mNum = d.getMonth();
      const mYear = d.getFullYear();

      const monthPayments = payments.filter((p) => {
        const pDate = new Date(p.createdAt);
        return pDate.getMonth() === mNum && pDate.getFullYear() === mYear;
      });

      const revenue = monthPayments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
      const expenses = monthPayments.reduce((sum, p) => sum + Number(p.expenses) + Number(p.employeeSalary || 0), 0);
      const profit = Math.max(0, revenue - expenses);

      last6Months.push({
        month: mName,
        revenue,
        profit,
      });
    }
    return last6Months;
  }, [payments]);

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
            <AreaChart data={chartData} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
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
              <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border-hsl))", background: "hsl(var(--card-hsl))" }} />
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

export function UpcomingDeadlines({
  projects: upcomingProjects,
  title = "Upcoming deadlines",
  description = "Calendar-aware delivery queue with overdue highlighting.",
}: {
  projects: {
    id: string;
    name: string;
    deadline: Date | string;
    isOverdue: boolean;
    priority: string;
    assignedEmployee?: { name: string | null } | null;
    client?: { name: string } | null;
  }[];
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingProjects.map((project) => {
          const uiPriority = labelPriority(project.priority);
          return (
            <div key={project.id} className={cn("flex items-center gap-3 rounded-md border border-border p-3", project.isOverdue && "border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30")}>
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-secondary text-xs font-medium">
                <span>{new Date(project.deadline).toLocaleString("en-IN", { month: "short" })}</span>
                <span className="text-sm text-foreground">{new Date(project.deadline).getDate()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{project.name}</p>
                <p className="truncate text-xs text-muted-foreground">{project.assignedEmployee?.name} · {project.client?.name}</p>
              </div>
              <Badge variant={project.isOverdue ? "danger" : statusBadge(uiPriority)}>{project.isOverdue ? "Overdue" : uiPriority}</Badge>
            </div>
          );
        })}
        {upcomingProjects.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No upcoming deadlines</p>
        )}
      </CardContent>
    </Card>
  );
}

export function PaymentTracker({ payments }: { payments: PaymentWithRelations[] }) {
  const paymentRows = useMemo(() => {
    return payments.map((payment) => ({
      ...payment,
      projectName: payment.project?.name ?? "No Project",
      profit: Number(payment.totalPayment) - Number(payment.expenses) - Number(payment.employeeSalary || 0),
      pending: Number(payment.totalPayment) - Number(payment.amountPaid),
    }));
  }, [payments]);

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Payment tracking</CardTitle>
        <CardDescription>Advance, expenses, profit, and pending balances.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentRows.slice(0, 5).map((payment) => {
          const uiStatus = labelPaymentStatus(payment.status);
          return (
            <div key={payment.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{payment.projectName}</p>
                  <p className="text-xs text-muted-foreground">Profit {formatCurrency(payment.profit)}</p>
                </div>
                <Badge variant={statusBadge(uiStatus)}>{uiStatus}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                <span className="text-muted-foreground">Advance<br /><b className="text-foreground">{formatCurrency(Number(payment.advancePayment))}</b></span>
                <span className="text-muted-foreground">Expenses<br /><b className="text-foreground">{formatCurrency(Number(payment.expenses))}</b></span>
                <span className="text-muted-foreground">Salary<br /><b className="text-foreground">{formatCurrency(Number(payment.employeeSalary || 0))}</b></span>
                <span className="text-muted-foreground">Pending<br /><b className="text-foreground">{formatCurrency(payment.pending)}</b></span>
              </div>
            </div>
          );
        })}
        {paymentRows.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No payment history</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ClientManagement({ clients }: { clients: Client[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client management</CardTitle>
        <CardDescription>Contact details, company, and payment state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {clients.slice(0, 5).map((client) => {
          const uiPaymentStatus = labelPaymentStatus(client.paymentStatus);
          return (
            <div key={client.id} className="flex items-center gap-3 rounded-md border border-border p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold">{initials(client.name)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{client.name}</p>
                <p className="truncate text-xs text-muted-foreground">{client.companyName}</p>
                <p className="truncate text-xs text-muted-foreground">{client.phone}</p>
              </div>
              <Badge variant={statusBadge(uiPaymentStatus)}>{uiPaymentStatus}</Badge>
            </div>
          );
        })}
        {clients.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No clients yet</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ActivityAndNotifications() {
  const mounted = useMounted();

  interface ActivityItem {
    id: string;
    actor: string;
    action: string;
    project: string;
    time: string;
  }
  const activities: ActivityItem[] = [];

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
          {activities.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">No recent team activity</p>
          )}
        </div>
        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Alerts
          </div>
          {mounted ? (
            <ResponsiveContainer width="100%" height={145}>
              <BarChart data={[
                { name: "Assigned", value: 0 },
                { name: "Deadlines", value: 0 },
                { name: "Reviews", value: 0 },
                { name: "Payments", value: 0 },
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

export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
