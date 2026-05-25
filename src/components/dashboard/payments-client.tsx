"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PaymentsClient({ payments }: { payments: any[] }) {
  const [search, setSearch] = useState("");

  const filteredPayments = payments.filter((p) => 
    p.client?.name.toLowerCase().includes(search.toLowerCase()) || 
    p.project?.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track all payments, advances, and pending dues.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payments.reduce((acc, curr) => acc + (curr.totalPayment || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payments.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {formatCurrency(payments.reduce((acc, curr) => {
                const pending = (curr.totalPayment || 0) - (curr.amountPaid || 0);
                return acc + (pending > 0 ? pending : 0);
              }, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(payments.reduce((acc, curr) => acc + (curr.expenses || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>A list of all recent payments and their statuses.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients or projects..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Client</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Project</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Total</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Paid</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Pending</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Last Updated</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => {
                      const total = payment.totalPayment || 0;
                      const paid = payment.amountPaid || 0;
                      const pending = Math.max(0, total - paid);

                      return (
                        <tr key={payment.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{payment.client?.name}</td>
                          <td className="p-4 text-muted-foreground">{payment.project?.name || "N/A"}</td>
                          <td className="p-4 font-medium">{formatCurrency(total)}</td>
                          <td className="p-4 text-emerald-600 font-medium">{formatCurrency(paid)}</td>
                          <td className="p-4 text-amber-600 font-medium">{formatCurrency(pending)}</td>
                          <td className="p-4 text-muted-foreground">
                            {format(new Date(payment.updatedAt), "MMM dd, yyyy")}
                          </td>
                          <td className="p-4">
                            {payment.status === "PAID" ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Paid</Badge>
                            ) : payment.status === "PARTIAL" ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Partial</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">Pending</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
