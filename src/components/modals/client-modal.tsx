"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient, updateClient } from "@/lib/actions/client-actions";
import type { Client } from "@prisma/client";
import { labelPaymentStatus } from "@/types/db";

const PAYMENT_STATUSES = ["Paid", "Partial", "Pending", "Overdue"];

type FormState = { name: string; phone: string; email: string; companyName: string; paymentStatus: string; };
const empty: FormState = { name: "", phone: "", email: "", companyName: "", paymentStatus: "Pending" };

interface Props { open: boolean; onClose: () => void; client?: Client | null; }

export function ClientModal({ open, onClose, client }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setForm(client
      ? { name: client.name, phone: client.phone, email: client.email, companyName: client.companyName, paymentStatus: labelPaymentStatus(client.paymentStatus) }
      : empty);
  }, [client, open]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      if (client) {
        await updateClient(client.id, form);
      } else {
        await createClient(form);
      }
      onClose();
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle>
        <DialogDescription>{client ? `Editing "${client.name}"` : "Add a new client to your roster"}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-1.5">
          <Label htmlFor="cm-name">Full name *</Label>
          <Input id="cm-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Nova Dental" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cm-company">Company / Brand name</Label>
          <Input id="cm-company" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Nova Dental Clinic" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cm-phone">Phone</Label>
            <Input id="cm-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98XXX XXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cm-email">Email</Label>
            <Input id="cm-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@client.com" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cm-payment">Account payment status</Label>
          <Select id="cm-payment" value={form.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value)}>
            {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || !form.name.trim()}>
          {isPending ? "Saving…" : client ? "Save changes" : "Add client"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
