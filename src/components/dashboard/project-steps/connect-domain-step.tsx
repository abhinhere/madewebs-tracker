"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function ConnectDomainStep({ project, handleUpdate }: { project: any; handleUpdate: (data: any) => void }) {
  const [checklist, setChecklist] = useState(project.domainChecklist || {
    connectVercel: false,
    sslVerification: false,
    seoMeta: false,
    favicon: false,
    sitemap: false,
    robotsTxt: false,
    googleBusiness: false,
  });

  const handleCheck = (key: string, checked: boolean) => {
    const newChecklist = { ...checklist, [key]: checked };
    setChecklist(newChecklist);
    handleUpdate({ domainChecklist: newChecklist });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-4">
        <h4 className="font-medium">Connect Domain & Essentials</h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="vercel" 
            checked={checklist.connectVercel} 
            onCheckedChange={(c) => handleCheck("connectVercel", !!c)} 
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="vercel">Connect Vercel with Domain</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="ssl" 
            checked={checklist.sslVerification} 
            onCheckedChange={(c) => handleCheck("sslVerification", !!c)} 
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="ssl">SSL Verification</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="meta" 
            checked={checklist.seoMeta} 
            onCheckedChange={(c) => handleCheck("seoMeta", !!c)} 
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="meta">SEO Essential: Meta Tags</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="favicon" 
            checked={checklist.favicon} 
            onCheckedChange={(c) => handleCheck("favicon", !!c)} 
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="favicon">Favicon Setup</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="sitemap" 
            checked={checklist.sitemap} 
            onCheckedChange={(c) => handleCheck("sitemap", !!c)} 
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="sitemap">Sitemap Submitted</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="robots" 
            checked={checklist.robotsTxt} 
            onCheckedChange={(c) => handleCheck("robotsTxt", !!c)} 
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="robots">Robots.txt verified</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="gmb" 
            checked={checklist.googleBusiness} 
            onCheckedChange={(c) => handleCheck("googleBusiness", !!c)} 
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="gmb">Google Business Basic Setup</Label>
        </div>
      </div>
    </div>
  );
}
