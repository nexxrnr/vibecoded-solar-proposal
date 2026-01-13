"use client";

import { useProposal } from "@/context/proposal-context";
import { WizardShell } from "@/components/wizard/WizardShell";
import { Step1Location } from "@/components/steps/Step1Location";
import { Step2Usage } from "@/components/steps/Step2Usage";
import { Step3System } from "@/components/steps/Step3System";
import { Step4Results } from "@/components/steps/Step4Results";

export default function Home() {
  const { currentStep } = useProposal();

  return (
    <WizardShell>
      {currentStep === 1 && <Step1Location />}
      {currentStep === 2 && <Step2Usage />}
      {currentStep === 3 && <Step3System />}
      {currentStep === 4 && <Step4Results />}
    </WizardShell>
  );
}
