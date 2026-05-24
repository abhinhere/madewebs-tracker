"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function SetupStep({ project, handleUpdate }: { project: any; handleUpdate: (data: any) => void }) {
  const [checklist, setChecklist] = useState(project.setupChecklist || {
    structureCreated: false,
    gitRepo: false,
    pushedCode: false,
    deployedVercel: false,
  });
  const [testLink, setTestLink] = useState(project.deployedUrl || "");

  const handleCheck = (key: string, checked: boolean) => {
    const newChecklist = { ...checklist, [key]: checked };
    setChecklist(newChecklist);
    handleUpdate({ setupChecklist: newChecklist });
  };

  const saveLink = () => {
    handleUpdate({ deployedUrl: testLink });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-4">
        <h4 className="font-medium">Setup Checklist</h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="structure" 
            checked={checklist.structureCreated} 
            onCheckedChange={(c) => handleCheck("structureCreated", !!c)} 
          />
          <Label htmlFor="structure">Create project structure</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="git" 
            checked={checklist.gitRepo} 
            onCheckedChange={(c) => handleCheck("gitRepo", !!c)} 
          />
          <Label htmlFor="git">Initialize Git Repository</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="push" 
            checked={checklist.pushedCode} 
            onCheckedChange={(c) => handleCheck("pushedCode", !!c)} 
          />
          <Label htmlFor="push">Push initial code</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="vercel" 
            checked={checklist.deployedVercel} 
            onCheckedChange={(c) => handleCheck("deployedVercel", !!c)} 
          />
          <Label htmlFor="vercel">Deploy on Vercel</Label>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Label>Deployed Test Link</Label>
        <Input 
          value={testLink} 
          onChange={(e) => setTestLink(e.target.value)} 
          onBlur={saveLink} 
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
