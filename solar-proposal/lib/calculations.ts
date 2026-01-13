// Main calculation orchestrator
// Combines all calculation modules to produce final results

import { calculateUbill } from "./ubill";
import { calculateSolarBill } from "./solar-bill";
import { calculateCO2 } from "./co2";
import {
  MonthlyUsage,
  MonthlyProduction,
  CalculationResults,
  RoofSurface,
} from "./types";
import { GREEN_ZONE_LIMIT } from "./constants";

interface CalculateAllParams {
  monthlyUsage: MonthlyUsage;
  monthlyProduction: MonthlyProduction;
  annualProduction: number;
  systemCost: number;
  higherTariffPercent: number;
  permittedPower: number;
  panelPower: number;
  productionPerKwp: number;
}

/**
 * Calculate 25 years (300 months) of bills and find breakeven point
 */
export function calculateAll(params: CalculateAllParams): CalculationResults {
  const {
    monthlyUsage,
    monthlyProduction,
    annualProduction,
    systemCost,
    higherTariffPercent,
    permittedPower,
    panelPower,
    productionPerKwp,
  } = params;

  // Calculate annual usage
  const annualUsage = Object.values(monthlyUsage).reduce((sum, val) => sum + val, 0);

  // Calculate 300 months of bills
  const monthlyUbills: { [key: number]: number } = {};
  const monthlySolarBills: { [key: number]: number } = {};
  let excessHelper = 0;

  for (let i = 1; i <= 300; i++) {
    const month = i % 12 === 0 ? 12 : i % 12;
    const year = Math.floor((i - 1) / 12);

    // Regular bill
    const ubill = calculateUbill(
      month,
      year,
      monthlyUsage[month],
      higherTariffPercent,
      permittedPower
    );
    monthlyUbills[i] = ubill.cost;

    // Solar bill
    const solarBill = calculateSolarBill(
      month,
      year,
      monthlyUsage[month],
      monthlyProduction[month],
      excessHelper,
      higherTariffPercent,
      permittedPower
    );
    monthlySolarBills[i] = solarBill.cost;
    excessHelper = solarBill.excessForNextMonth;
  }

  // Find breakeven point
  let cumulativeUbillCost = 0;
  let cumulativeSolarCost = systemCost;
  let breakEvenMonths = 300; // Default to max if not found

  for (let i = 1; i <= 300; i++) {
    cumulativeSolarCost += monthlySolarBills[i];
    cumulativeUbillCost += monthlyUbills[i];

    if (cumulativeSolarCost <= cumulativeUbillCost) {
      breakEvenMonths = i;
      break;
    }
  }

  // Calculate first year costs for display
  const monthlyBillsPreSolar: MonthlyUsage = {};
  const monthlyBillsPostSolar: MonthlyUsage = {};

  for (let month = 1; month <= 12; month++) {
    monthlyBillsPreSolar[month] = monthlyUbills[month];
    monthlyBillsPostSolar[month] = monthlySolarBills[month];
  }

  const annualCostPreSolar = Object.values(monthlyBillsPreSolar).reduce(
    (sum, val) => sum + val,
    0
  );
  const annualCostPostSolar = Object.values(monthlyBillsPostSolar).reduce(
    (sum, val) => sum + val,
    0
  );
  const annualSavings = annualCostPreSolar - annualCostPostSolar;

  // Breakeven formatting
  const breakEvenYears = Math.floor(breakEvenMonths / 12);
  const breakEvenExtraMonths = breakEvenMonths % 12;

  let breakEvenString: string;
  if (breakEvenExtraMonths === 0) {
    breakEvenString = `${breakEvenYears} godina`;
  } else if (breakEvenExtraMonths === 1) {
    breakEvenString = `${breakEvenYears} godina i ${breakEvenExtraMonths} mesec`;
  } else if (breakEvenExtraMonths < 5) {
    breakEvenString = `${breakEvenYears} godina i ${breakEvenExtraMonths} meseca`;
  } else {
    breakEvenString = `${breakEvenYears} godina i ${breakEvenExtraMonths} meseci`;
  }

  const yearsInProfit = 25 - breakEvenYears - (breakEvenExtraMonths > 0 ? 1 : 0);

  // Solar coverage
  const solarPercentageOfUsage = Math.min(100, (annualProduction / annualUsage) * 100);
  const importPercentageOfUsage = 100 - solarPercentageOfUsage;

  // CO2 calculations
  const co2 = calculateCO2(annualUsage, annualProduction);

  // Sweet spot recommendation
  const recommendation = calculateSweetSpot(
    monthlyUsage,
    higherTariffPercent,
    productionPerKwp,
    panelPower
  );

  return {
    monthlyBillsPreSolar,
    monthlyBillsPostSolar,
    annualCostPreSolar,
    annualCostPostSolar,
    annualSavings,
    breakEvenMonths,
    breakEvenYears,
    breakEvenExtraMonths,
    breakEvenString,
    yearsInProfit,
    solarPercentageOfUsage,
    importPercentageOfUsage,
    co2ReductionKg: co2.reductionKg,
    treesEquivalent: co2.numberOfTreesEquivalent,
    carKmEquivalent: co2.carKilometresEquivalent,
    recommendedPanels: recommendation.panels,
    recommendedPowerKw: recommendation.powerKw,
  };
}

/**
 * Calculate the sweet spot for maximum ROI
 * Goal: Produce enough to eliminate blue and red zone usage (day tariff only)
 */
export function calculateSweetSpot(
  monthlyUsage: MonthlyUsage,
  higherTariffPercent: number,
  productionPerKwp: number,
  panelPower: number
): {
  panels: { min: number; optimal: number; max: number };
  powerKw: { min: number; optimal: number; max: number };
  annualBlueRedUsage: number;
} {
  // Calculate annual blue+red zone usage (day tariff portion above 350 kWh)
  let annualBlueRedUsage = 0;

  for (let month = 1; month <= 12; month++) {
    const dayUsage = monthlyUsage[month] * higherTariffPercent;
    const blueRedPortion = Math.max(0, dayUsage - GREEN_ZONE_LIMIT);
    annualBlueRedUsage += blueRedPortion;
  }

  // Optimal production = cover all blue+red usage
  const optimalKwp = annualBlueRedUsage / productionPerKwp;
  const optimalPanels = Math.round((optimalKwp * 1000) / panelPower);

  // Min = 85% coverage (some buffer for variations)
  const minKwp = optimalKwp * 0.85;
  const minPanels = Math.floor((minKwp * 1000) / panelPower);

  // Max = 110% coverage (slight overproduction for safety)
  const maxKwp = optimalKwp * 1.1;
  const maxPanels = Math.ceil((maxKwp * 1000) / panelPower);

  return {
    panels: {
      min: Math.max(1, minPanels),
      optimal: Math.max(1, optimalPanels),
      max: Math.max(1, maxPanels),
    },
    powerKw: {
      min: Math.round(minKwp * 10) / 10,
      optimal: Math.round(optimalKwp * 10) / 10,
      max: Math.round(maxKwp * 10) / 10,
    },
    annualBlueRedUsage,
  };
}

/**
 * Calculate production scaled by number of panels assigned to each surface
 * This is used when user changes panel allocation in Step 3
 */
export function scaleProduction(
  baseProductionPerKwp: MonthlyProduction,
  surfaces: RoofSurface[],
  panelPower: number
): { monthly: MonthlyProduction; annual: number } {
  const scaledMonthly: MonthlyProduction = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
    7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
  };

  // Total kWp of the system
  const totalPanels = surfaces.reduce((sum, s) => sum + s.assignedPanels, 0);
  const totalKwp = (totalPanels * panelPower) / 1000;

  // Scale base production by total kWp
  for (let month = 1; month <= 12; month++) {
    scaledMonthly[month] = Math.round(baseProductionPerKwp[month] * totalKwp);
  }

  const annual = Object.values(scaledMonthly).reduce((sum, val) => sum + val, 0);

  return { monthly: scaledMonthly, annual };
}
