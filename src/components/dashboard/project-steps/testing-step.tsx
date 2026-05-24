"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function TestingStep({ project, handleUpdate }: { project: any; handleUpdate: (data: any) => void }) {
  const [checklist, setChecklist] = useState(project.testingChecklist || {
    responsive: false,
    featuresFunctioning: false,
    basicSeo: false,
  });

  const handleCheck = (key: string, checked: boolean) => {
    const newChecklist = { ...checklist, [key]: checked };
    setChecklist(newChecklist);
    handleUpdate({ testingChecklist: newChecklist });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-4">
        <h4 className="font-medium">Testing Checklist</h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="responsive" 
            checked={checklist.responsive} 
            onCheckedChange={(c) => handleCheck("responsive", !!c)} 
          />
          <Label htmlFor="responsive">Responsive across devices</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="features" 
            checked={checklist.featuresFunctioning} 
            onCheckedChange={(c) => handleCheck("featuresFunctioning", !!c)} 
          />
          <Label htmlFor="features">All features are functioning correctly</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="seo" 
            checked={checklist.basicSeo} 
            onCheckedChange={(c) => handleCheck("basicSeo", !!c)} 
          />
          <Label htmlFor="seo">Basic SEO verified (meta tags, structure)</Label>
        </div>
      </div>
    </div>
  );
}
