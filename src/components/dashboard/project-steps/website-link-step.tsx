"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WebsiteLinkStep({ project, handleUpdate, syncData }: { project: any; handleUpdate: (data: any) => void; syncData?: (data: any) => void; }) {
  const [websiteUrl, setWebsiteUrl] = useState(project.websiteUrl || "");
  const [renewalDate, setRenewalDate] = useState(
    project.renewalDate ? new Date(project.renewalDate).toISOString().split('T')[0] : ""
  );

  const save = () => {
    handleUpdate({ 
      websiteUrl, 
      renewalDate: renewalDate || null
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label>Live Website URL</Label>
        <Input 
          value={websiteUrl} 
          onChange={(e) => {
            setWebsiteUrl(e.target.value);
            if (syncData) syncData({ websiteUrl: e.target.value });
          }} 
          onBlur={save}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Renewal Date</Label>
        <Input 
          type="date" 
          value={renewalDate} 
          onChange={(e) => {
            setRenewalDate(e.target.value);
            if (syncData) syncData({ renewalDate: e.target.value || null });
          }} 
          onBlur={save}
        />
        <p className="text-xs text-muted-foreground pt-2">
          An automated email will be sent to the customer and madewebspot@gmail.com on this date.
        </p>
      </div>
    </div>
  );
}
