"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

export function RequirementCollectionStep({ project, handleUpdate, role = "ADMIN" }: { project: any; handleUpdate: (data: any) => void; role?: string; }) {
  const [data, setData] = useState({
    businessName: project.businessName || "",
    logoUrl: project.logoUrl || "",
    contactNumber: project.contactNumber || "",
    contactEmail: project.contactEmail || "",
    location: project.location || "",
    packageType: project.packageType || "",
    domainNeed: project.domainNeed || false,
    websiteUrl: project.websiteUrl || "",
    notes: project.notes || "",
    totalAmount: project.payments?.[0]?.totalPayment || project.totalAmount || 0,
  });

  const handleChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const save = () => {
    const numAmount = Number(data.totalAmount);
    handleUpdate({
      ...data,
      totalAmount: numAmount,
      totalPayment: numAmount, // This triggers the payment sync in project-actions
    });
  };

  if (project.workType !== "WEBSITE") {
    return <div className="text-muted-foreground">Requirements collection for this work type is not fully specified. Use notes section.</div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input name="businessName" value={data.businessName} onChange={handleChange} onBlur={save} />
        </div>
        <div className="space-y-2">
          <Label>Logo (Upload)</Label>
          <div className="flex items-center gap-2">
            {data.logoUrl && data.logoUrl.startsWith("data:") && <img src={data.logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded border" />}
            <Input type="file" accept="image/*" onChange={(e: any) => {
              if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setData({ ...data, logoUrl: reader.result as string });
                };
                reader.readAsDataURL(e.target.files[0]);
              }
            }} onBlur={save} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Contact Number</Label>
          <Input name="contactNumber" value={data.contactNumber} onChange={handleChange} onBlur={save} />
        </div>
        <div className="space-y-2">
          <Label>Contact Email</Label>
          <Input name="contactEmail" type="email" value={data.contactEmail} onChange={handleChange} onBlur={save} />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input name="location" value={data.location} onChange={handleChange} onBlur={save} />
        </div>
        <div className="space-y-2">
          <Label>Package</Label>
          <Select 
            value={data.packageType} 
            onChange={(e) => {
              const value = e.target.value;
              let amount = data.totalAmount;
              if (value === "Basic") amount = 3999;
              if (value === "Starter") amount = 5999;
              if (value === "Professional") amount = 9999;
              if (value === "Premium") amount = 15000;
              
              setData({ ...data, packageType: value, totalAmount: amount });
              handleUpdate({ packageType: value, totalAmount: amount, totalPayment: amount });
            }}
          >
            <option value="">Select a package...</option>
            <option value="Basic">Basic: 3999/-</option>
            <option value="Starter">Starter: 5999/-</option>
            <option value="Professional">Professional: 9999/-</option>
            <option value="Premium">Premium: 15000/-</option>
            <option value="Custom">Custom</option>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 py-4">
        <Switch 
          checked={data.domainNeed} 
          onCheckedChange={(checked) => {
            setData({ ...data, domainNeed: checked });
            handleUpdate({ domainNeed: checked });
          }} 
        />
        <Label>Domain Name Needed</Label>
      </div>

      {data.domainNeed && (
        <div className="space-y-2">
          <Label>Domain Name</Label>
          <Input name="websiteUrl" value={data.websiteUrl} onChange={handleChange} onBlur={save} placeholder="e.g. example.com" />
        </div>
      )}

      {role !== "EMPLOYEE" && (
        <div className="space-y-2">
          <Label>Total Amount</Label>
          <Input name="totalAmount" type="number" value={data.totalAmount} onChange={handleChange} onBlur={save} />
        </div>
      )}

      <div className="space-y-2">
        <Label>Notes / Extra Features</Label>
        <Textarea name="notes" value={data.notes} onChange={handleChange} onBlur={save} rows={4} />
      </div>
    </div>
  );
}
