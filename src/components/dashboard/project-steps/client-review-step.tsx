"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ClientReviewStep({ project, handleUpdate, role = "ADMIN", syncData }: { project: any; handleUpdate: (data: any) => void; role?: string; syncData?: (data: any) => void; }) {
  const [clientApproved, setClientApproved] = useState(project.clientApproved || false);
  const [clientChanges, setClientChanges] = useState(project.clientChanges || "");

  const handleShare = () => {
    const text = `Hi, please review your project deployed at: ${project.deployedUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareEmployee = () => {
    const employeeName = project.assignedEmployee?.name || 'team';
    const text = `Hi ${employeeName}, the client has requested the following changes for ${project.name}:\n\n${clientChanges}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const saveChanges = () => {
    handleUpdate({ clientChanges, clientApproved });
  };

  const handleNotifyAdmin = () => {
    const text = `Hi Admin, please test the project ${project.name} here: ${project.deployedUrl || project.websiteUrl || 'Link missing'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSubmitChanges = () => {
    const text = `Hi Admin, I have completed the requested changes for ${project.name}. Please review them.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    handleUpdate({ reviewStatus: "PENDING_REVIEW" });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-4">
        {role !== "EMPLOYEE" ? (
          <h4 className="font-medium">Share for Review</h4>
        ) : (
          <h4 className="font-medium">Test Link</h4>
        )}
        <div className="flex items-center space-x-4">
          {role !== "EMPLOYEE" && (
            <Button onClick={handleShare}>Share on WhatsApp</Button>
          )}
          {role === "EMPLOYEE" && (
            <Button onClick={handleNotifyAdmin} variant="secondary">Notify Admin (WhatsApp)</Button>
          )}
          {project.deployedUrl && (
            <a href={project.deployedUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
              View Test Link
            </a>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        {!clientApproved ? (
          <>
            <Label>Client Feedback / Requested Changes</Label>
            <Textarea 
              value={clientChanges} 
              onChange={(e) => {
                setClientChanges(e.target.value);
                if (syncData) syncData({ clientChanges: e.target.value });
              }} 
              onBlur={saveChanges}
              placeholder="Enter changes requested by the client..."
              rows={4}
              readOnly={role === "EMPLOYEE"}
            />
            {role !== "EMPLOYEE" ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 gap-3">
                <p className="text-xs text-muted-foreground">If changes are suggested, assign them to the employee.</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleShareEmployee} disabled={!clientChanges.trim()}>
                    Share to Employee (WhatsApp)
                  </Button>
                </div>
              </div>
            ) : (
              clientChanges.trim() && (
                <div className="pt-2">
                  <Button onClick={handleSubmitChanges} size="sm" className="w-full sm:w-auto">
                    Submit Changes Completed
                  </Button>
                </div>
              )
            )}
          </>
        ) : (
          <div className="pt-2">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Client Approved! No further changes needed.
            </span>
          </div>
        )}
      </div>

      {role !== "EMPLOYEE" && (
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Switch 
            checked={clientApproved} 
            onCheckedChange={(checked) => {
              setClientApproved(checked);
              handleUpdate({ 
                clientApproved: checked,
                reviewStatus: checked ? "CLIENT_APPROVED" : "CLIENT_REVIEWING"
              });
            }} 
            className="data-[state=checked]:bg-emerald-500"
          />
          <Label>Mark Client Approved</Label>
        </div>
      )}
    </div>
  );
}
