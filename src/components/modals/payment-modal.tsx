"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordPayment, updatePaymentFinancials } from "@/lib/actions/payment-actions";
import type { Payment, PaymentHistory } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

type PaymentWithHistory = Omit<Payment, "totalPayment" | "advancePayment" | "amountPaid" | "expenses"> & {
  totalPayment: number;
  advancePayment: number;
  amountPaid: number;
  expenses: number;
  history: (Omit<PaymentHistory, "amount"> & { amount: number })[];
};

interface Props {
  open: boolean;
  onClose: () => void;
  payment: PaymentWithHistory | null;
  projectName?: string;
}

export function PaymentModal({ open, onClose, payment, projectName }: Props) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [expenses, setExpenses] = useState("");
  const [totalPayment, setTotalPayment] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setExpenses(String(payment?.expenses ?? ""));
    setTotalPayment(String(payment?.totalPayment ?? ""));
    setAmount("");
    setNote("");
  }, [payment, open]);

  function handleRecord() {
    if (!payment || !amount || Number(amount) <= 0) return;
    startTransition(async () => {
      await recordPayment(payment.id, Number(amount), note);
      setAmount(""); setNote("");
      onClose();
    });
  }

  function handleUpdateFinancials() {
    if (!payment) return;
    startTransition(async () => {
      await updatePaymentFinancials(payment.id, {
        totalPayment: Number(totalPayment),
        expenses: Number(expenses),
      });
      onClose();
    });
  }

  if (!payment) return null;

  const pending = Number(payment.totalPayment) - Number(payment.amountPaid);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Payment — {projectName}</DialogTitle>
        <DialogDescription>Record a payment or update financial details</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-4 gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <div><p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Total</p><p className="font-semibold">{formatCurrency(Number(payment.totalPayment))}</p></div>
          <div><p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Advance</p><p className="font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(Number(payment.advancePayment))}</p></div>
          <div><p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Total Paid</p><p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(payment.amountPaid))}</p></div>
          <div><p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Pending</p><p className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(pending)}</p></div>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Record new payment</p>
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount (₹)</Label>
            <Input id="pay-amount" type="number" min={1} value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder={`Up to ${formatCurrency(pending)}`} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-note">Note</Label>
            <Textarea id="pay-note" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Milestone 2 payment" rows={2} />
          </div>
          <Button onClick={handleRecord} disabled={isPending || !amount || Number(amount) <= 0} className="w-full">
            {isPending ? "Recording…" : "Record payment"}
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Update financials</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-total">Total amount (₹)</Label>
              <Input id="pay-total" type="number" value={totalPayment} onChange={(e) => setTotalPayment(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-expenses">Expenses (₹)</Label>
              <Input id="pay-expenses" type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
            </div>
          </div>
          <Button variant="outline" onClick={handleUpdateFinancials} disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Update financials"}
          </Button>
        </div>

        {payment.history.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Payment history</p>
            {payment.history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{formatCurrency(Number(h.amount))}</p>
                  <p className="text-xs text-muted-foreground">{h.note}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(h.paidAt).toLocaleDateString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}
