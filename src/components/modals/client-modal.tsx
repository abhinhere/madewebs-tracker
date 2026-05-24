"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, updateClient, deleteClient } from "@/lib/actions/client-actions";
import type { Client } from "@prisma/client";

type FormState = { name: string; phone: string; email: string; companyName: string; paymentStatus: string; };
const empty: FormState = { name: "", phone: "", email: "", companyName: "", paymentStatus: "Pending" };

interface Props {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}

export function ClientModal({ open, onClose, client }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      if (client) {
        setForm({
          name: client.name,
          phone: client.phone ?? "",
          email: client.email ?? "",
          companyName: client.companyName ?? "",
          paymentStatus: client.paymentStatus === "PAID" ? "Paid"
            : client.paymentStatus === "PARTIAL" ? "Partial"
            : client.paymentStatus === "OVERDUE" ? "Overdue"
            : "Pending",
        });
      } else {
        setForm(empty);
      }
    }
  }, [open, client]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;

    // Auto-generate phone and email if left blank
    let finalPhone = form.phone.trim();
    if (!finalPhone) {
      const randDigits = Math.floor(100000000 + Math.random() * 900000000);
      finalPhone = `+91 9${randDigits.toString().slice(0, 4)} ${randDigits.toString().slice(4)}`;
    }

    let finalEmail = form.email.trim();
    if (!finalEmail) {
      const cleanCompany = form.companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanName = form.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const domain = cleanCompany || cleanName || "client";
      const user = cleanName || "info";
      finalEmail = `${user}@${domain}.com`;
    }

    startTransition(async () => {
      const submission = {
        ...form,
        phone: finalPhone,
        email: finalEmail,
      };
      if (client) {
        await updateClient(client.id, submission);
      } else {
        await createClient(submission);
      }
      onClose();
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle>
        <DialogDescription>
          {client ? `Updating details for "${client.name}"` : "Add a new client to your roster"}
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cm-name">Full name *</Label>
          <Input id="cm-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Nova Dental" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cm-phone">Phone</Label>
          <Input id="cm-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Left blank to auto-generate" />
        </div>
      </DialogBody>
      <DialogFooter>
        {client && (
          <div className="mr-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (confirm("Permanently delete this client and all associated projects and payments? This cannot be undone.")) {
                  startTransition(async () => {
                    await deleteClient(client.id);
                    onClose();
                  });
                }
              }}
              disabled={isPending}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 cursor-pointer"
            >
              Delete Client
            </Button>
          </div>
        )}
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || !form.name.trim()}>
          {isPending ? (client ? "Saving…" : "Adding…") : (client ? "Save changes" : "Add client")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
