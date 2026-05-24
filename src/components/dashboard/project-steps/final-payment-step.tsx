"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function FinalPaymentStep({ project, handleUpdate, role = "ADMIN" }: { project: any; handleUpdate: (data: any) => void; role?: string; }) {
  const remaining = Number(project.totalAmount || 0) - Number(project.advanceAmount || 0);

  const [data, setData] = useState({
    finalPaymentAmount: project.finalPaymentAmount ? Number(project.finalPaymentAmount) : remaining,
    finalPaymentMode: project.finalPaymentMode || "",
    employeeSalary: project.payments?.[0]?.employeeSalary || 0,
    expenses: project.payments?.[0]?.expenses || 0,
  });

  const handleChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  };

  const save = () => {
    handleUpdate({
      ...data,
      employeeSalary: Number(data.employeeSalary),
      expenses: Number(data.expenses),
    });
  };

  if (role === "EMPLOYEE") {
    return (
      <div className="text-muted-foreground p-4 bg-muted/30 rounded-md border border-dashed border-border text-center">
        Final payment details are managed by the administration team.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-muted p-4 rounded-md mb-6 space-y-1">
        <p className="text-sm">Total Amount: <strong>{Number(project.totalAmount || 0)}</strong></p>
        <p className="text-sm">Advance Paid: <strong>{Number(project.advanceAmount || 0)}</strong></p>
        <p className="text-sm text-muted-foreground">Remaining: <strong>{remaining}</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Final Payment Amount</Label>
        <Input name="finalPaymentAmount" type="number" value={data.finalPaymentAmount} onChange={handleChange} onBlur={save} />
      </div>

      <div className="space-y-2">
        <Label>Mode of Payment</Label>
        <Select 
          value={data.finalPaymentMode} 
          onChange={(e) => {
            const value = e.target.value;
            setData({ ...data, finalPaymentMode: value });
            handleUpdate({ ...data, finalPaymentMode: value });
          }}
        >
          <option value="">Select payment mode...</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Employee Salary</Label>
        <Input name="employeeSalary" type="number" value={data.employeeSalary} onChange={handleChange} onBlur={save} />
      </div>

      <div className="space-y-2">
        <Label>Other Expenses</Label>
        <Input name="expenses" type="number" value={data.expenses} onChange={handleChange} onBlur={save} />
      </div>
    </div>
  );
}
