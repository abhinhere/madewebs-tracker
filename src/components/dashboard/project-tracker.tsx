"use client";

import { useState, useRef, useEffect } from "react";
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

const ALL_STEPS = [
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
  onClose?: () => void;
}

export function ProjectTracker({ initialProject, clients, role = "ADMIN", onClose }: ProjectTrackerProps) {
  const [project, setProject] = useState(initialProject);
  const [currentOriginalIndex, setCurrentOriginalIndex] = useState((project.currentStep || 1) - 1);
  const [isSaving, setIsSaving] = useState(false);
  const pendingDataRef = useRef<any>({});

  useEffect(() => {
    pendingDataRef.current = {};
  }, [currentOriginalIndex]);

  const syncData = (data: any) => {
    pendingDataRef.current = { ...pendingDataRef.current, ...data };
  };

  const visibleSteps = ALL_STEPS.map((label, index) => ({ label, originalIndex: index }))
    .filter(step => {
      if (role === "EMPLOYEE" && (step.originalIndex === 1 || step.originalIndex === 5)) {
        return false;
      }
      return true;
    });

  let activeVisibleIndex = visibleSteps.findIndex(s => s.originalIndex === currentOriginalIndex);
  const isHiddenStepActive = activeVisibleIndex === -1;
  if (isHiddenStepActive) {
    const pastVisibleSteps = visibleSteps.filter(s => s.originalIndex <= currentOriginalIndex);
    activeVisibleIndex = pastVisibleSteps.length > 0 ? pastVisibleSteps.length - 1 : 0;
  }

  const handleUpdate = async (data: any) => {
    try {
      setIsSaving(true);
      if (data.currentStep !== undefined) {
        data.taskCompletion = Math.round((data.currentStep / ALL_STEPS.length) * 100);
      }
      setProject((prev: any) => ({ ...prev, ...data })); // Optimistic update
      await updateProject(project.id, data);
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error("Failed to update project");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = () => {
    if (activeVisibleIndex < visibleSteps.length - 1) {
      const pendingData = pendingDataRef.current;
      pendingDataRef.current = {};
      const nextVisibleStep = visibleSteps[activeVisibleIndex + 1];
      const nextStepDbValue = nextVisibleStep.originalIndex + 1;
      setCurrentOriginalIndex(nextVisibleStep.originalIndex); // Instant update
      handleUpdate({ ...pendingData, currentStep: nextStepDbValue }); // Async in background
    }
  };

  const handlePrevStep = () => {
    if (activeVisibleIndex > 0) {
      const pendingData = pendingDataRef.current;
      pendingDataRef.current = {};
      const prevVisibleStep = visibleSteps[activeVisibleIndex - 1];
      const prevStepDbValue = prevVisibleStep.originalIndex + 1;
      setCurrentOriginalIndex(prevVisibleStep.originalIndex); // Instant update
      handleUpdate({ ...pendingData, currentStep: prevStepDbValue }); // Async in background
    }
  };

  const renderStepContent = () => {
    // If the step is hidden, the activeVisibleIndex represents the last visible step.
    // If the user hasn't skipped past it, they see the content of that last visible step.
    const activeStepOriginalIndex = visibleSteps[activeVisibleIndex].originalIndex;
    const props = { project, handleUpdate, isSaving, role, onClose, syncData };

    if (isHiddenStepActive) {
      return (
        <div className="text-center py-10 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground font-medium">Waiting for administration to process the payment step...</p>
          <Button onClick={handleNextStep} disabled={isSaving}>Skip to Next Workflow Step</Button>
        </div>
      );
    }

    switch (activeStepOriginalIndex) {
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
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Project Tracker</CardTitle>
            <CardDescription>
              {project.name} - {project.workType}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>Close Tracker</Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="relative mb-8">
            <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-muted rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(activeVisibleIndex / (visibleSteps.length - 1)) * 100}%` }}
            ></div>
            <div className="relative flex justify-between">
              {visibleSteps.map((step, index) => {
                const isActive = index === activeVisibleIndex;
                const isCompleted = index < activeVisibleIndex;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background z-10 transition-colors shadow-sm
                      ${isActive ? 'border-primary text-primary scale-110' : ''}
                      ${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
                      ${!isActive && !isCompleted ? 'border-muted text-muted-foreground' : ''}
                    `}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-semibold text-sm">{index + 1}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">{visibleSteps[activeVisibleIndex].label}</h3>
            {renderStepContent()}
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={activeVisibleIndex === 0 || isSaving}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Step
            </Button>
            {activeVisibleIndex < visibleSteps.length - 1 && (
              <Button 
                onClick={handleNextStep}
                disabled={
                  isSaving || 
                  (role === "EMPLOYEE" && visibleSteps[activeVisibleIndex].originalIndex === 4 && !project.clientApproved)
                }
              >
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
