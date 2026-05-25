"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BellRing, Loader2 } from "lucide-react";
import { sendApprovalEmail } from "@/lib/actions/email-actions";

export function FinalApprovalStep({ project, handleUpdate, role = "ADMIN", onClose }: { project: any; handleUpdate: (data: any) => Promise<void> | void; role?: string; onClose?: () => void; }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(project.socialPostsChecklist || {
    instagramPost: false,
    worksPage: false,
    googleBusiness: false,
  });

  const [adminApproval, setAdminApproval] = useState(project.adminApproval || false);
  const [isNotifying, setIsNotifying] = useState(false);

  const handleCheck = (key: string, checked: boolean) => {
    const newChecklist = { ...checklist, [key]: checked };
    setChecklist(newChecklist);
    handleUpdate({ socialPostsChecklist: newChecklist });
  };

  const handleApproval = async (checked: boolean) => {
    setAdminApproval(checked);
    await handleUpdate({ 
      adminApproval: checked, 
      ...(checked ? { status: "COMPLETED", reviewStatus: "APPROVED" } : { status: project.status })
    });
    if (checked) {
      router.push("/projects");
    }
  };

  const notifyAdmin = async () => {
    try {
      setIsNotifying(true);
      await sendApprovalEmail(project.id, "All steps have been completed. Please review and provide final approval.");
      toast.success("Admin notified successfully!");
      if (onClose) onClose();
    } catch (error) {
      toast.error("Failed to notify admin");
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-4">
        <h4 className="font-medium">Social Posts & Updates</h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="insta" 
            checked={checklist.instagramPost} 
            onCheckedChange={(c) => handleCheck("instagramPost", !!c)} 
          />
          <Label htmlFor="insta">Adding to MadeWebs Works post in Instagram</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="works" 
            checked={checklist.worksPage} 
            onCheckedChange={(c) => handleCheck("worksPage", !!c)} 
          />
          <Label htmlFor="works">Website Works Page Updation</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="gmb-post" 
            checked={checklist.googleBusiness} 
            onCheckedChange={(c) => handleCheck("googleBusiness", !!c)} 
          />
          <Label htmlFor="gmb-post">Google Business Post</Label>
        </div>
      </div>

      {role === "EMPLOYEE" ? (
        <div className="space-y-4 pt-6 border-t border-border/50">
          <div className="bg-muted/30 p-4 rounded-lg border border-border flex flex-col gap-3">
            <div>
              <h4 className="font-semibold text-foreground">Project Ready for Final Review?</h4>
              <p className="text-sm text-muted-foreground">Once all tasks are completed, notify the admin to finalize the project.</p>
            </div>
            <Button onClick={notifyAdmin} disabled={isNotifying} className="w-full sm:w-auto self-start">
              {isNotifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BellRing className="h-4 w-4 mr-2" />}
              Notify Admin for Approval
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-6 border-t border-destructive/20">
          <h4 className="font-medium text-destructive">Admin Zone</h4>
          <div className="flex items-center space-x-4 bg-destructive/10 p-4 rounded-md">
            <Switch 
              checked={adminApproval} 
              onCheckedChange={handleApproval} 
              disabled={!checklist.instagramPost || !checklist.worksPage || !checklist.googleBusiness}
            />
            <Label className="text-destructive font-semibold">Final Approval from Admin</Label>
          </div>
          {adminApproval && <p className="text-sm text-green-600 font-medium">Project marked as COMPLETED!</p>}
        </div>
      )}
    </div>
  );
}
