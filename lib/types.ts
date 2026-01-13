// Core types for the solar proposal app

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface RoofSurface {
  id: string;
  name: string;
  orientation: number; // -180 to 180, where 0 = South
  slope: number; // 0 to 90 degrees
  shading: number; // 0 to 1 (percentage as decimal)
  maxPanels: number; // Sales rep estimate
  assignedPanels: number; // How many panels placed on this surface
}

export interface MonthlyUsage {
  [month: number]: number; // 1-12 -> kWh
}

export interface MonthlyProduction {
  [month: number]: number; // 1-12 -> kWh
}

export interface SystemConfig {
  panelPower: number; // Watts per panel (e.g., 400)
  totalPanels: number;
  totalPowerKw: number;
  cost: number; // RSD
}

export interface UtilityData {
  monthlyUsage: MonthlyUsage;
  annualUsage: number;
  higherTariffPercent: number; // typically 0.85
  permittedPower: number; // typically 11.04 kW
}

export interface ProposalData {
  // Step 1: Location & Roofs
  address: string;
  coordinates: Coordinates;
  roofSurfaces: RoofSurface[];

  // Step 2: Utility data
  utility: UtilityData;

  // Fetched from PVGIS API (after step 2)
  monthlyProduction: MonthlyProduction | null;
  annualProduction: number | null;
  productionPerKwp: number | null; // kWh per kWp per year for this location

  // Step 3: System configuration
  system: SystemConfig;

  // Step 4: Calculated results
  results: CalculationResults | null;
}

export interface CalculationResults {
  // Monthly bills comparison
  monthlyBillsPreSolar: MonthlyUsage;
  monthlyBillsPostSolar: MonthlyUsage;

  // Annual totals
  annualCostPreSolar: number;
  annualCostPostSolar: number;
  annualSavings: number;

  // ROI
  breakEvenMonths: number;
  breakEvenYears: number;
  breakEvenExtraMonths: number;
  breakEvenString: string;
  yearsInProfit: number;

  // Coverage
  solarPercentageOfUsage: number;
  importPercentageOfUsage: number;

  // CO2
  co2ReductionKg: number;
  treesEquivalent: number;
  carKmEquivalent: number;

  // Sweet spot recommendation
  recommendedPanels: {
    min: number;
    optimal: number;
    max: number;
  };
  recommendedPowerKw: {
    min: number;
    optimal: number;
    max: number;
  };
}

// Orientation options for dropdown
export const ORIENTATION_OPTIONS = [
  { value: 0, label: "Jug", labelEn: "South" },
  { value: 45, label: "Jugozapad", labelEn: "Southwest" },
  { value: -45, label: "Jugoistok", labelEn: "Southeast" },
  { value: 90, label: "Zapad", labelEn: "West" },
  { value: -90, label: "Istok", labelEn: "East" },
  { value: 135, label: "Severozapad", labelEn: "Northwest" },
  { value: -135, label: "Severoistok", labelEn: "Northeast" },
  { value: 180, label: "Sever", labelEn: "North" },
] as const;

// Default values
export const DEFAULT_HIGHER_TARIFF_PERCENT = 0.85;
export const DEFAULT_PERMITTED_POWER = 11.04;
export const DEFAULT_PANEL_POWER = 400;
