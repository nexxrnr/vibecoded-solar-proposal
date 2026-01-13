"use client";

import { useProposal } from "@/context/proposal-context";
import { ReactNode } from "react";

const steps = [
  { number: 1, title: "Lokacija i krov", shortTitle: "Lokacija" },
  { number: 2, title: "Potrošnja struje", shortTitle: "Potrošnja" },
  { number: 3, title: "Konfiguracija sistema", shortTitle: "Sistem" },
  { number: 4, title: "Cena i rezultati", shortTitle: "Rezultati" },
];

interface WizardShellProps {
  children: ReactNode;
}

export function WizardShell({ children }: WizardShellProps) {
  const { currentStep, setStep } = useProposal();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-solar-blue text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-solar-yellow rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-solar-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Solar Proposal</h1>
                <p className="text-xs text-slate-300">Kalkulator solarnih sistema</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(step.number)}
                  className={`flex items-center gap-2 group ${
                    step.number <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  }`}
                  disabled={step.number > currentStep}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step.number === currentStep
                        ? "bg-solar-yellow text-solar-blue ring-4 ring-solar-yellow/30"
                        : step.number < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        step.number === currentStep ? "text-solar-blue" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <p
                      className={`text-xs font-medium ${
                        step.number === currentStep ? "text-solar-blue" : "text-slate-500"
                      }`}
                    >
                      {step.shortTitle}
                    </p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.number < currentStep ? "bg-green-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
