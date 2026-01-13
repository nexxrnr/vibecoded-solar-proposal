"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  ProposalData,
  RoofSurface,
  MonthlyUsage,
  MonthlyProduction,
  CalculationResults,
  DEFAULT_HIGHER_TARIFF_PERCENT,
  DEFAULT_PERMITTED_POWER,
  DEFAULT_PANEL_POWER,
} from "@/lib/types";
import { SERBIAN_CITIES } from "@/lib/serbia-cities";
import { calculateAll, scaleProduction } from "@/lib/calculations";

interface ProposalContextType {
  data: ProposalData;
  currentStep: number;
  isLoading: boolean;
  error: string | null;

  // Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1: Location & Roofs
  setAddress: (address: string) => void;
  setCoordinates: (lat: number, lon: number) => void;
  addRoofSurface: (surface: Omit<RoofSurface, "id" | "assignedPanels">) => void;
  updateRoofSurface: (id: string, updates: Partial<RoofSurface>) => void;
  removeRoofSurface: (id: string) => void;

  // Step 2: Utility data
  setMonthlyUsage: (usage: MonthlyUsage) => void;
  setHigherTariffPercent: (percent: number) => void;
  setPermittedPower: (power: number) => void;

  // Fetch production data (after step 2)
  fetchProductionData: () => Promise<void>;

  // Step 3: System configuration
  setPanelPower: (power: number) => void;
  setAssignedPanels: (surfaceId: string, panels: number) => void;

  // Step 4: Pricing
  setSystemCost: (cost: number) => void;

  // Recalculate results (called whenever inputs change in steps 3-4)
  recalculateResults: () => void;
}

const defaultMonthlyUsage: MonthlyUsage = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
  7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
};

const initialData: ProposalData = {
  address: SERBIAN_CITIES[0].name,
  coordinates: { lat: SERBIAN_CITIES[0].lat, lon: SERBIAN_CITIES[0].lon },
  roofSurfaces: [],
  utility: {
    monthlyUsage: { ...defaultMonthlyUsage },
    annualUsage: 0,
    higherTariffPercent: DEFAULT_HIGHER_TARIFF_PERCENT,
    permittedPower: DEFAULT_PERMITTED_POWER,
  },
  monthlyProduction: null,
  annualProduction: null,
  productionPerKwp: null,
  system: {
    panelPower: DEFAULT_PANEL_POWER,
    totalPanels: 0,
    totalPowerKw: 0,
    cost: 0,
  },
  results: null,
};

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

// Helper function to run calculations on current state
function runCalculations(state: ProposalData): CalculationResults | null {
  const { utility, monthlyProduction, productionPerKwp, system, roofSurfaces } = state;

  if (!monthlyProduction || !productionPerKwp || system.totalPanels === 0) {
    return null;
  }

  // Scale production based on assigned panels
  const scaled = scaleProduction(monthlyProduction, roofSurfaces, system.panelPower);

  return calculateAll({
    monthlyUsage: utility.monthlyUsage,
    monthlyProduction: scaled.monthly,
    annualProduction: scaled.annual,
    systemCost: system.cost,
    higherTariffPercent: utility.higherTariffPercent,
    permittedPower: utility.permittedPower,
    panelPower: system.panelPower,
    productionPerKwp,
  });
}

export function ProposalProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ProposalData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation
  const setStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(4, step)));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(4, prev + 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  // Step 1: Location & Roofs
  const setAddress = useCallback((address: string) => {
    setData((prev) => ({ ...prev, address }));
  }, []);

  const setCoordinates = useCallback((lat: number, lon: number) => {
    setData((prev) => ({ ...prev, coordinates: { lat, lon } }));
  }, []);

  const addRoofSurface = useCallback(
    (surface: Omit<RoofSurface, "id" | "assignedPanels">) => {
      const newSurface: RoofSurface = {
        ...surface,
        id: `surface-${Date.now()}`,
        assignedPanels: 0,
      };
      setData((prev) => ({
        ...prev,
        roofSurfaces: [...prev.roofSurfaces, newSurface],
      }));
    },
    []
  );

  const updateRoofSurface = useCallback((id: string, updates: Partial<RoofSurface>) => {
    setData((prev) => ({
      ...prev,
      roofSurfaces: prev.roofSurfaces.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const removeRoofSurface = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      roofSurfaces: prev.roofSurfaces.filter((s) => s.id !== id),
    }));
  }, []);

  // Step 2: Utility data
  const setMonthlyUsage = useCallback((usage: MonthlyUsage) => {
    const annualUsage = Object.values(usage).reduce((sum, val) => sum + val, 0);
    setData((prev) => ({
      ...prev,
      utility: { ...prev.utility, monthlyUsage: usage, annualUsage },
    }));
  }, []);

  const setHigherTariffPercent = useCallback((percent: number) => {
    setData((prev) => ({
      ...prev,
      utility: { ...prev.utility, higherTariffPercent: percent },
    }));
  }, []);

  const setPermittedPower = useCallback((power: number) => {
    setData((prev) => ({
      ...prev,
      utility: { ...prev.utility, permittedPower: power },
    }));
  }, []);

  // Fetch production data from PVGIS API
  const fetchProductionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current state values
      const currentData = await new Promise<ProposalData>((resolve) => {
        setData((prev) => {
          resolve(prev);
          return prev;
        });
      });

      const { coordinates, roofSurfaces } = currentData;

      // Prepare surfaces for API call
      const surfaces = roofSurfaces.map((s) => ({
        angle: s.slope,
        aspect: s.orientation,
        peakpower: 1,
        shading: s.shading,
      }));

      const response = await fetch("/api/pvgis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: coordinates.lat,
          lon: coordinates.lon,
          surfaces,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch production data");
      }

      const result = await response.json();

      setData((prev) => ({
        ...prev,
        monthlyProduction: result.baseMonthlyPerKwp,
        annualProduction: result.baseAnnualPerKwp,
        productionPerKwp: result.baseAnnualPerKwp,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Step 3: System configuration - WITH auto-recalculation
  const setPanelPower = useCallback((power: number) => {
    setData((prev) => {
      const totalPanels = prev.roofSurfaces.reduce(
        (sum, s) => sum + s.assignedPanels,
        0
      );
      const newState = {
        ...prev,
        system: {
          ...prev.system,
          panelPower: power,
          totalPowerKw: (totalPanels * power) / 1000,
        },
      };
      // Auto-recalculate results
      newState.results = runCalculations(newState);
      return newState;
    });
  }, []);

  const setAssignedPanels = useCallback((surfaceId: string, panels: number) => {
    setData((prev) => {
      const updatedSurfaces = prev.roofSurfaces.map((s) =>
        s.id === surfaceId ? { ...s, assignedPanels: panels } : s
      );
      const totalPanels = updatedSurfaces.reduce(
        (sum, s) => sum + s.assignedPanels,
        0
      );
      const newState = {
        ...prev,
        roofSurfaces: updatedSurfaces,
        system: {
          ...prev.system,
          totalPanels,
          totalPowerKw: (totalPanels * prev.system.panelPower) / 1000,
        },
      };
      // Auto-recalculate results
      newState.results = runCalculations(newState);
      return newState;
    });
  }, []);

  // Step 4: Pricing - WITH auto-recalculation
  const setSystemCost = useCallback((cost: number) => {
    setData((prev) => {
      const newState = {
        ...prev,
        system: { ...prev.system, cost },
      };
      // Auto-recalculate results
      newState.results = runCalculations(newState);
      return newState;
    });
  }, []);

  // Manual recalculate (can still be called explicitly)
  const recalculateResults = useCallback(() => {
    setData((prev) => ({
      ...prev,
      results: runCalculations(prev),
    }));
  }, []);

  return (
    <ProposalContext.Provider
      value={{
        data,
        currentStep,
        isLoading,
        error,
        setStep,
        nextStep,
        prevStep,
        setAddress,
        setCoordinates,
        addRoofSurface,
        updateRoofSurface,
        removeRoofSurface,
        setMonthlyUsage,
        setHigherTariffPercent,
        setPermittedPower,
        fetchProductionData,
        setPanelPower,
        setAssignedPanels,
        setSystemCost,
        recalculateResults,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}

export function useProposal() {
  const context = useContext(ProposalContext);
  if (context === undefined) {
    throw new Error("useProposal must be used within a ProposalProvider");
  }
  return context;
}
