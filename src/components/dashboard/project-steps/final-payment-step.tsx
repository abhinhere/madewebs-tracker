"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function FinalPaymentStep({ project, handleUpdate, role = "ADMIN" }: { project: any; handleUpdate: (data: any) => void; role?: string; }) {
  const remaining = Number(project.totalAmount || 0) - Number(project.advanceAmount || 0);

  const [data, setData] = useState({
    finalPaymentAmount: project.finalPaymentAmount ? Number(project.finalPaymentAmount) : "",
    finalPaymentMode: project.finalPaymentMode || "",
    employeeSalary: project.payments?.[0]?.employeeSalary || "",
    employeeSalaryPaid: project.payments?.[0]?.employeeSalaryPaid || false,
    expenses: project.payments?.[0]?.expenses || 0,
  });

  const handleChange = (e: any) => {
    const value = e.target.value;
    setData({ ...data, [e.target.name]: e.target.type === 'number' ? (value === '' ? '' : Number(value)) : value });
  };

  const save = () => {
    handleUpdate({
      ...data,
      employeeSalary: Number(data.employeeSalary),
      employeeSalaryPaid: Boolean(data.employeeSalaryPaid),
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
        <Input name="finalPaymentAmount" type="number" value={data.finalPaymentAmount} onChange={handleChange} onBlur={save} placeholder={String(remaining)} />
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

      <div className="space-y-2 pt-2 pb-2 border-t border-b">
        <Label>Employee Salary</Label>
        <Input name="employeeSalary" type="number" value={data.employeeSalary} onChange={handleChange} onBlur={save} placeholder={String(project.totalAmount ? Number(project.totalAmount) * 0.75 : 0)} />
        
        <div className="flex items-center space-x-2 pt-2">
          <input 
            type="checkbox" 
            id="salaryPaid"
            checked={data.employeeSalaryPaid} 
            onChange={(e) => {
              const checked = e.target.checked;
              setData({ ...data, employeeSalaryPaid: checked });
              handleUpdate({ ...data, employeeSalaryPaid: checked });
            }} 
            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
          />
          <Label htmlFor="salaryPaid" className="cursor-pointer">Mark Employee Salary as Paid</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Other Expenses</Label>
        <Input name="expenses" type="number" value={data.expenses} onChange={handleChange} onBlur={save} />
      </div>
    </div>
  );
}
