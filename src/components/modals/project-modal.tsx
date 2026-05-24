"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProject, updateProject } from "@/lib/actions/project-actions";
import { createClient } from "@/lib/actions/client-actions";
import { createPaymentForProject } from "@/lib/actions/payment-actions";
import type { Client, User } from "@prisma/client";
import type { ProjectWithRelations } from "@/types/db";
import { labelWorkType, labelStatus, labelPriority, labelReviewStatus } from "@/types/db";

const WORK_TYPES = ["Website", "Logo", "Poster", "Branding", "Web App", "SEO", "Maintenance"];
const REVIEW_STATUSES = ["Pending review", "Client reviewing", "Approved", "Changes requested"];

type FormState = {
  clientId: string;
  assignedEmployeeId: string;
  name: string;
  workType: string;
  status: string;
  priority: string;
  reviewStatus: string;
  startDate: string;
  deadline: string;
  notes: string;
  taskCompletion: number;
  instagramPostCompleted: boolean;
  instagramStoryCompleted: boolean;
  deliveryCompleted: boolean;
  websiteUrl: string;
  renewalDate: string;
};

const empty: FormState = {
  clientId: "", assignedEmployeeId: "", name: "",
  workType: "Website", status: "New", priority: "Medium",
  reviewStatus: "Pending review",
  startDate: new Date().toISOString().slice(0, 10), deadline: "",
  notes: "", taskCompletion: 0,
  instagramPostCompleted: false, instagramStoryCompleted: false, deliveryCompleted: false,
  websiteUrl: "", renewalDate: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  project?: ProjectWithRelations | null;
  clients: Client[];
  teamMembers?: User[];
}

export function ProjectModal({ open, onClose, project, clients, teamMembers = [] }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [totalWorkAmount, setTotalWorkAmount] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [employeeSalary, setEmployeeSalary] = useState("");

  useEffect(() => {
    setIsCreatingClient(false);
    setClientName("");
    setClientCompany("");
    setClientPhone("");
    setClientEmail("");

    if (project) {
      setForm({
        clientId: project.clientId,
        assignedEmployeeId: project.assignedEmployeeId,
        name: project.name,
        workType: labelWorkType(project.workType),
        status: labelStatus(project.status),
        priority: labelPriority(project.priority),
        reviewStatus: labelReviewStatus(project.reviewStatus),
        startDate: project.startDate.toISOString().slice(0, 10),
        deadline: project.deadline.toISOString().slice(0, 10),
        notes: project.notes ?? "",
        taskCompletion: project.taskCompletion,
        instagramPostCompleted: project.instagramPostCompleted,
        instagramStoryCompleted: project.instagramStoryCompleted,
        deliveryCompleted: project.deliveryCompleted,
        websiteUrl: project.websiteUrl ?? "",
        renewalDate: project.renewalDate ? project.renewalDate.toISOString().slice(0, 10) : "",
      });
      const payment = project.payments?.[0];
      setTotalWorkAmount(payment ? String(payment.totalPayment) : "");
      setAdvancePayment(payment ? String(payment.advancePayment) : "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEmployeeSalary(payment && (payment as any).employeeSalary ? String((payment as any).employeeSalary) : "");
    } else {
      setForm({
        ...empty,
        assignedEmployeeId: teamMembers?.[0]?.id || "",
      });
      setTotalWorkAmount("");
      setAdvancePayment("");
      setEmployeeSalary("");
    }
  }, [project, open, teamMembers]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim() || !form.deadline) return;
    if (!isCreatingClient && !form.clientId) return;
    if (isCreatingClient && !clientName.trim()) return;

    startTransition(async () => {
      let activeClientId = form.clientId;

      if (isCreatingClient) {
        const newClient = await createClient({
          name: clientName,
          companyName: clientCompany,
          phone: clientPhone,
          email: clientEmail,
          paymentStatus: "Pending",
        });
        activeClientId = newClient.id;
      }

      const projectData = {
        ...form,
        clientId: activeClientId,
      };

      if (project) {
        await updateProject(project.id, {
          ...projectData,
          totalPayment: Number(totalWorkAmount) || 0,
          advancePayment: Number(advancePayment) || 0,
          employeeSalary: Number(employeeSalary) || 0,
        });
      } else {
        const newProj = await createProject(projectData);
        const total = Number(totalWorkAmount) || 0;
        const advance = Number(advancePayment) || 0;
        const salary = Number(employeeSalary) || 0;
        await createPaymentForProject({
          clientId: activeClientId,
          projectId: newProj.id,
          totalPayment: total,
          advancePayment: advance,
          expenses: 0,
          employeeSalary: salary,
        });
        onClose();
        router.push(`/projects/${newProj.id}`);
      }
    });
  }

  // Get available members — fall back to assignedEmployee from project if no teamMembers list provided
  const members = teamMembers.length > 0
    ? teamMembers
    : project ? [project.assignedEmployee] : [];

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl">
      <DialogHeader onClose={onClose}>
        <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
        <DialogDescription>{project ? `Editing "${project.name}"` : "Add a new project to the tracker"}</DialogDescription>
      </DialogHeader>

      <DialogBody>
        <div className="space-y-1.5">
          <Label htmlFor="pm-name">Project name *</Label>
          <Input id="pm-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Nova Dental Website" disabled={!!project} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!project && (
            isCreatingClient ? (
              <div className="col-span-2 border border-dashed border-border rounded-lg p-3.5 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Client Details</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingClient(false)}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    ← Select existing client
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-client-name">Client name *</Label>
                  <Input
                    id="new-client-name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Nova Dental"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-client-phone">Phone</Label>
                    <Input
                      id="new-client-phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-client-email">Email</Label>
                    <Input
                      id="new-client-email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="hello@client.com"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pm-client">Client *</Label>
                  {!project && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingClient(true)}
                      className="text-xs text-foreground/75 hover:text-foreground hover:underline font-medium"
                    >
                      + Add Client
                    </button>
                  )}
                </div>
                <Select id="pm-client" value={form.clientId} onChange={(e) => set("clientId", e.target.value)} disabled={!!project}>
                  <option value="">Select client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
            )
          )}
          <div className={(!project && !isCreatingClient) ? "space-y-1.5" : "space-y-1.5 col-span-2"}>
            <Label htmlFor="pm-worktype">Work type</Label>
            <Select id="pm-worktype" value={form.workType} onChange={(e) => set("workType", e.target.value)} disabled={!!project}>
              {WORK_TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>

          {project && form.workType === "Website" && (
            <div className="col-span-2 grid grid-cols-2 gap-3 border border-dashed border-border rounded-lg p-3 bg-muted/5">
              <div className="space-y-1.5">
                <Label htmlFor="pm-web-url">Website URL</Label>
                <Input
                  id="pm-web-url"
                  value={form.websiteUrl}
                  onChange={(e) => set("websiteUrl", e.target.value)}
                  placeholder="e.g. example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pm-renewal">Domain Renewal Date</Label>
                <Input
                  id="pm-renewal"
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) => set("renewalDate", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {!project && (
          <div className="space-y-1.5">
            <Label htmlFor="pm-assigned">Assigned to</Label>
            <Select id="pm-assigned" value={form.assignedEmployeeId} onChange={(e) => set("assignedEmployeeId", e.target.value)}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </div>
        )}

        {project && (
          <div className="space-y-1.5">
            <Label htmlFor="pm-review">Review status</Label>
            <Select id="pm-review" value={form.reviewStatus} onChange={(e) => set("reviewStatus", e.target.value)}>
              {REVIEW_STATUSES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </div>
        )}

        {!project && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pm-start">Start date</Label>
              <Input id="pm-start" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-deadline">Deadline *</Label>
              <Input id="pm-deadline" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </div>
          </div>
        )}

        {project && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pm-total-amount">Total Work Amount (₹)</Label>
              <Input
                id="pm-total-amount"
                type="number"
                min={0}
                value={totalWorkAmount}
                onChange={(e) => setTotalWorkAmount(e.target.value)}
                placeholder="e.g. 15000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-advance">Advance Payment (₹)</Label>
              <Input
                id="pm-advance"
                type="number"
                min={0}
                value={advancePayment}
                onChange={(e) => setAdvancePayment(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-salary">Employee Salary (₹)</Label>
              <Input
                id="pm-salary"
                type="number"
                min={0}
                value={employeeSalary}
                onChange={(e) => setEmployeeSalary(e.target.value)}
                placeholder="e.g. 2000"
              />
            </div>
          </div>
        )}

        {project && (
          <div className="space-y-1.5">
            <Label htmlFor="pm-task">Task completion: {form.taskCompletion}%</Label>
            <input id="pm-task" type="range" min={0} max={100} value={form.taskCompletion}
              onChange={(e) => set("taskCompletion", Number(e.target.value))}
              className="w-full accent-foreground" />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="pm-notes">Notes</Label>
          <Textarea id="pm-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)}
            placeholder="Internal notes…" rows={3} />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || !form.name.trim() || !form.deadline || (isCreatingClient ? !clientName.trim() : !form.clientId)}>
          {isPending ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
