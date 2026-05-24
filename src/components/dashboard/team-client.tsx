"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMemberModal } from "@/components/modals/team-member-modal";
import { deleteTeamMember } from "@/lib/actions/team-actions";
import type { User } from "@prisma/client";
import { labelRole } from "@/types/db";
import type { ProjectWithRelations } from "@/types/db";
import { initials } from "@/lib/utils";

interface Props {
  members: User[];
  projects: ProjectWithRelations[];
}

export function TeamClient({ members, projects }: Props) {
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showPlainPassword, setShowPlainPassword] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  function openNew() { setEditingMember(null); setModalOpen(true); }
  function openEdit(m: User) { setEditingMember(m); setModalOpen(true); }

  function openDetails(m: User) {
    setSelectedMember(m);
    setDetailsOpen(true);
    setShowPlainPassword(true);
    setCopiedEmail(false);
    setCopiedPassword(false);
  }

  function handleCopyEmail() {
    if (!selectedMember) return;
    navigator.clipboard.writeText(selectedMember.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  const selectedPassword = selectedMember
    ? (selectedMember.plainPassword || (selectedMember.email === "abhin@madewebs.local" ? "Abhin2004#" : "madewebs123"))
    : "";

  function handleCopyPassword() {
    navigator.clipboard.writeText(selectedPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this team member? This cannot be undone.")) return;
    startTransition(() => { deleteTeamMember(id); });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Team members</CardTitle>
            <CardDescription>View, add, and manage agency developers and managers.</CardDescription>
          </div>
          <Button size="sm" onClick={openNew} className="w-full sm:w-auto"><Plus className="h-4 w-4" />Add member</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member) => {
            const assigned = projects.filter((p) => p.assignedEmployeeId === member.id && !p.archived);
            const completion = assigned.length
              ? Math.round(assigned.reduce((sum, p) => sum + (p.taskCompletion ?? 0), 0) / assigned.length)
              : 0;

            return (
              <div
                key={member.id}
                onClick={() => openDetails(member)}
                className="cursor-pointer rounded-lg border border-border p-4 space-y-3 bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {member.image ? (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border">
                        <img src={member.image} alt={member.name || "Team member"} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold">
                        {initials(member.name ?? "")}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.position} · {member.email}</p>
                      <p className="text-xs flex items-center gap-1.5 flex-wrap">
                        <span className="text-muted-foreground">Password:</span>
                        <span className="font-mono bg-muted border border-border/80 px-2 py-0.5 rounded text-foreground font-semibold select-all">
                          {member.plainPassword || (member.email === "abhin@madewebs.local" ? "Abhin2004#" : "madewebs123")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge variant="muted">{assigned.length} project{assigned.length !== 1 ? "s" : ""}</Badge>
                    <Badge variant="info">{labelRole(member.role)}</Badge>
                    <div className="flex items-center gap-1 ml-auto sm:ml-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(member);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50 hover:border-red-100 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {assigned.length > 0 && (
                  <p className="text-xs text-muted-foreground border-t border-border/60 pt-2">{completion}% avg task completion across {assigned.length} project{assigned.length !== 1 ? "s" : ""}</p>
                )}
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-sm font-medium text-foreground">No team members yet</p>
              <p className="text-xs text-muted-foreground mt-1">Get started by adding employees to your agency dashboard.</p>
              <Button size="sm" onClick={openNew} className="mt-4"><Plus className="h-4 w-4" />Add member</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TeamMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        member={editingMember}
        existingMembers={members}
      />

      {/* Team Member Credentials Modal */}
      <Dialog
        open={detailsOpen && !!selectedMember}
        onClose={() => setDetailsOpen(false)}
        className="max-w-md"
      >
        <DialogHeader onClose={() => setDetailsOpen(false)}>
          <DialogTitle>Team Member Credentials</DialogTitle>
          <DialogDescription>
            Account credentials and access levels for {selectedMember?.name}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-lg border border-border">
            {selectedMember?.image ? (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
                <img src={selectedMember.image} alt={selectedMember.name || "Member"} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-semibold">
                {selectedMember ? initials(selectedMember.name ?? "") : ""}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{selectedMember?.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{selectedMember?.position}</p>
            </div>
            <Badge variant="info">{selectedMember ? labelRole(selectedMember.role) : ""}</Badge>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Login Email (ID)</Label>
              <div className="relative flex items-center">
                <Input
                  value={selectedMember?.email || ""}
                  readOnly
                  className="bg-muted/5 font-medium pr-10 cursor-default focus:ring-0 focus-visible:ring-0 border-border"
                />
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Password</Label>
              <div className="relative flex items-center">
                <Input
                  value={showPlainPassword ? selectedPassword : "••••••••••••"}
                  type={showPlainPassword ? "text" : "password"}
                  readOnly
                  className="bg-muted/5 font-mono font-medium pr-20 cursor-default focus:ring-0 focus-visible:ring-0 border-border"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPlainPassword(!showPlainPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 cursor-pointer"
                    title={showPlainPassword ? "Hide password" : "Show password"}
                  >
                    {showPlainPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 cursor-pointer border-l border-border pl-1.5"
                    title="Copy password"
                  >
                    {copiedPassword ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDetailsOpen(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
