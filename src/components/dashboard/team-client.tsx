"use client";

import { useState, useTransition } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMemberModal } from "@/components/modals/team-member-modal";
import { deleteTeamMember } from "@/lib/actions/team-actions";
import type { User, Project } from "@prisma/client";
import { labelRole } from "@/types/db";
import { initials } from "@/lib/utils";

interface Props {
  members: User[];
  projects: Project[];
}

export function TeamClient({ members, projects }: Props) {
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  function openNew() { setEditingMember(null); setModalOpen(true); }
  function openEdit(m: User) { setEditingMember(m); setModalOpen(true); }

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
              <div key={member.id} className="rounded-lg border border-border p-4 space-y-3 bg-card hover:shadow-sm transition-shadow">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold">
                      {initials(member.name ?? "")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.position} · {member.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge variant="muted">{assigned.length} project{assigned.length !== 1 ? "s" : ""}</Badge>
                    <Badge variant="info">{labelRole(member.role)}</Badge>
                    <div className="flex items-center gap-1 ml-auto sm:ml-0">
                      <button onClick={() => openEdit(member)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50 hover:border-red-100" title="Delete">
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
    </div>
  );
}
