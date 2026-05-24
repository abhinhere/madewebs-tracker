"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Client } from "@prisma/client";

export function LeadStep({ project, handleUpdate, clients }: { project: any; handleUpdate: (data: any) => void; clients: Client[] }) {
  const [clientId, setClientId] = useState(project.clientId || "");
  const [workType, setWorkType] = useState(project.workType || "WEBSITE");

  const save = () => {
    handleUpdate({ clientId, workType });
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <Label>Select Client</Label>
        <Select 
          value={clientId} 
          onChange={(e) => {
            setClientId(e.target.value);
            handleUpdate({ clientId: e.target.value });
          }}
        >
          <option value="" disabled>Select a client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.companyName})
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Work Type</Label>
        <Select 
          value={workType} 
          onChange={(e) => {
            setWorkType(e.target.value);
            handleUpdate({ workType: e.target.value });
          }}
        >
          <option value="" disabled>Select work type</option>
          <option value="WEBSITE">Website</option>
          <option value="LOGO">Logo</option>
          <option value="POSTER">Poster</option>
          <option value="BRANDING">Branding</option>
          <option value="WEB_APP">Web App</option>
          <option value="SEO">SEO</option>
          <option value="MAINTENANCE">Maintenance</option>
        </Select>
      </div>
    </div>
  );
}
