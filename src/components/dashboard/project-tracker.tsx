"use client";

import { useState } from "react";
import { Project, Client } from "@prisma/client";
import { updateProject } from "@/lib/actions/project-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

// Step Components (will be imported)
import { LeadStep } from "./project-steps/lead-step";
import { RequirementCollectionStep } from "./project-steps/requirement-collection-step";
import { AdvancePaymentStep } from "./project-steps/advance-payment-step";
import { SetupStep } from "./project-steps/setup-step";
import { TestingStep } from "./project-steps/testing-step";
import { ClientReviewStep } from "./project-steps/client-review-step";
import { FinalPaymentStep } from "./project-steps/final-payment-step";
import { ConnectDomainStep } from "./project-steps/connect-domain-step";
import { WebsiteLinkStep } from "./project-steps/website-link-step";
import { FinalApprovalStep } from "./project-steps/final-approval-step";

const steps = [
  "Requirement Collection",
  "Advance Payment",
  "Setup & Build",
  "Testing",
  "Client Review",
  "Final Payment",
  "Connect Domain",
  "Website Link",
  "Final Approval",
];

interface ProjectTrackerProps {
  initialProject: any;
  clients?: Client[];
  role?: "ADMIN" | "EMPLOYEE";
}

export function ProjectTracker({ initialProject, clients, role = "ADMIN" }: ProjectTrackerProps) {
  const [project, setProject] = useState(initialProject);
  const [currentStepIndex, setCurrentStepIndex] = useState((project.currentStep || 1) - 1);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (data: any) => {
    try {
      setIsSaving(true);
      if (data.currentStep !== undefined) {
        data.taskCompletion = Math.round((data.currentStep / steps.length) * 100);
      }
      await updateProject(project.id, data);
      setProject((prev: any) => ({ ...prev, ...data }));
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error("Failed to update project");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = currentStepIndex + 2;
      await handleUpdate({ currentStep: nextStep });
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = async () => {
    if (currentStepIndex > 0) {
      const prevStep = currentStepIndex;
      await handleUpdate({ currentStep: prevStep });
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const renderStepContent = () => {
    const props = { project, handleUpdate, isSaving, role };
    switch (currentStepIndex) {
      case 0: return <RequirementCollectionStep {...props} />;
      case 1: return <AdvancePaymentStep {...props} />;
      case 2: return <SetupStep {...props} />;
      case 3: return <TestingStep {...props} />;
      case 4: return <ClientReviewStep {...props} />;
      case 5: return <FinalPaymentStep {...props} />;
      case 6: return <ConnectDomainStep {...props} />;
      case 7: return <WebsiteLinkStep {...props} />;
      case 8: return <FinalApprovalStep {...props} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Project Tracker</CardTitle>
          <CardDescription>
            {project.name} - {project.workType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-12">
            <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-muted rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background z-10 transition-colors
                      ${isActive ? 'border-primary text-primary' : ''}
                      ${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
                      ${!isActive && !isCompleted ? 'border-muted text-muted-foreground' : ''}
                    `}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span>{index + 1}</span>}
                    </div>
                    <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground text-center w-24">
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">{steps[currentStepIndex]}</h3>
            {renderStepContent()}
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0 || isSaving}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Step
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1 || isSaving}
            >
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
