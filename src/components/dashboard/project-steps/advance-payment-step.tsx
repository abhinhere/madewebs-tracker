"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AdvancePaymentStep({ project, handleUpdate, role = "ADMIN", syncData }: { project: any; handleUpdate: (data: any) => void; role?: string; syncData?: (data: any) => void; }) {
  const defaultAdvance = project.totalAmount ? (Number(project.totalAmount) * 0.2) : 0;
  
  const [data, setData] = useState({
    advanceAmount: project.advanceAmount ? Number(project.advanceAmount) : "",
    domainCharge: project.domainCharge ? Number(project.domainCharge) : 0,
  });

  const handleChange = (e: any) => {
    const value = e.target.value;
    const newData = { ...data, [e.target.name]: value === '' ? '' : Number(value) };
    setData(newData);
    if (syncData) syncData(newData);
  };

  const save = () => {
    handleUpdate(data);
  };

  if (role === "EMPLOYEE") {
    return (
      <div className="text-muted-foreground p-4 bg-muted/30 rounded-md border border-dashed border-border text-center">
        Payment collection is managed by the administration team.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-muted p-4 rounded-md mb-6">
        <p className="text-sm">Total Amount: <strong>{Number(project.totalAmount || 0)}</strong></p>
        <p className="text-sm text-muted-foreground">Suggested 20% Advance: <strong>{defaultAdvance}</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Advance Payment Amount</Label>
        <Input name="advanceAmount" type="number" value={data.advanceAmount} onChange={handleChange} onBlur={save} placeholder={String(defaultAdvance)} />
      </div>

      {project.domainNeed && (
        <div className="space-y-2">
          <Label>Domain Charge (Not added to total)</Label>
          <Input name="domainCharge" type="number" value={data.domainCharge} onChange={handleChange} onBlur={save} />
        </div>
      )}
    </div>
  );
}
