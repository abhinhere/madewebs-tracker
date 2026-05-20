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
import { Eye, EyeOff } from "lucide-react";

const ROLES = ["Admin", "Manager", "Employee"];

type FormState = { name: string; email: string; role: string; position: string; capacity: number; password?: string; };
const empty: FormState = { name: "", email: "", role: "Employee", position: "", capacity: 4, password: "" };

interface Props {
  open: boolean;
  onClose: () => void;
  member?: User | null;
  existingMembers?: User[];
}

export function TeamMemberModal({ open, onClose, member }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [showPassword, setShowPassword] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (member) {
      const defaultPassword = member.plainPassword || (member.email === "abhin@madewebs.local" ? "Abhin2004#" : "madewebs123");
      setForm({
        name: member.name ?? "",
        email: member.email,
        role: labelRole(member.role),
        position: member.position ?? "",
        capacity: member.capacity ?? 4,
        password: defaultPassword,
      });
    } else {
      setForm(empty);
    }
    setShowPassword(true);
  }, [member, open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      const payload = { ...form };
      if (member) {
        await updateTeamMember(member.id, payload);
      } else {
        await createTeamMember(payload);
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
        <div className="space-y-1.5">
          <Label htmlFor="tm-password">Password</Label>
          <div className="relative flex items-center">
            <Input
              id="tm-password"
              type={showPassword ? "text" : "password"}
              value={form.password || ""}
              onChange={(e) => set("password", e.target.value)}
              placeholder="e.g. Min. 6 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
