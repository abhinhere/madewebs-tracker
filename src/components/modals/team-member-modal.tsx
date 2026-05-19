"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createTeamMember, updateTeamMember } from "@/lib/actions/team-actions";
import type { User } from "@prisma/client";
import { labelRole } from "@/types/db";

const ROLES = ["Admin", "Manager", "Employee"];

type FormState = { name: string; email: string; role: string; position: string; capacity: number; };
const empty: FormState = { name: "", email: "", role: "Employee", position: "", capacity: 4 };

interface Props {
  open: boolean;
  onClose: () => void;
  member?: User | null;
  existingMembers?: User[];
}

export function TeamMemberModal({ open, onClose, member }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setForm(member
      ? { name: member.name ?? "", email: member.email, role: labelRole(member.role), position: member.position ?? "", capacity: member.capacity ?? 4 }
      : empty);
  }, [member, open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      if (member) {
        await updateTeamMember(member.id, form);
      } else {
        await createTeamMember(form);
      }
      onClose();
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{member ? "Edit team member" : "Add team member"}</DialogTitle>
        <DialogDescription>{member ? `Editing "${member.name}"` : "Add a new person to your team"}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-1.5">
          <Label htmlFor="tm-name">Full name *</Label>
          <Input id="tm-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Amarnath" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tm-email">Email</Label>
          <Input id="tm-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@madewebs.local" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tm-role">Role</Label>
            <Select id="tm-role" value={form.role} onChange={(e) => set("role", e.target.value)}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tm-position">Position / title</Label>
            <Input id="tm-position" value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="e.g. Lead Developer" />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || !form.name.trim()}>
          {isPending ? "Saving…" : member ? "Save changes" : "Add member"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
