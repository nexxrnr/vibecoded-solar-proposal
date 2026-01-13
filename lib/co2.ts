// CO2 reduction calculator
// Ported from co2.py

import {
  SERBIA_PERCENT_FROM_COAL,
  KG_OF_CO2_PER_KWH_COAL,
  ADULT_TREE_ABSORPTION_KG_YEAR,
  CO2_CAR_PER_100_KM,
} from "./constants";

export interface CO2Result {
  annualCO2OutputPreSolar: number;
  annualCO2OutputPostSolar: number;
  reductionKg: number;
  numberOfTreesEquivalent: number;
  carKilometresEquivalent: number;
}

/**
 * Calculate annual CO2 reduction from solar installation
 *
 * @param annualUsage - Annual electricity usage in kWh
 * @param annualSolarProduction - Annual solar production in kWh
 */
export function calculateCO2(
  annualUsage: number,
  annualSolarProduction: number
): CO2Result {
  // Serbia's grid emissions (mainly from coal)
  const annualCO2OutputPreSolar =
    annualUsage * SERBIA_PERCENT_FROM_COAL * KG_OF_CO2_PER_KWH_COAL;

  const annualCO2OutputPostSolar =
    (annualUsage - annualSolarProduction) *
    SERBIA_PERCENT_FROM_COAL *
    KG_OF_CO2_PER_KWH_COAL;

  const reductionKg = Math.round(annualCO2OutputPreSolar - annualCO2OutputPostSolar);

  // Equivalent to planting this many trees
  const numberOfTreesEquivalent = Math.round(reductionKg / ADULT_TREE_ABSORPTION_KG_YEAR);

  // Equivalent to this many km driven by car
  const carKilometresEquivalent = Math.round((reductionKg / CO2_CAR_PER_100_KM) * 100);

  return {
    annualCO2OutputPreSolar,
    annualCO2OutputPostSolar,
    reductionKg,
    numberOfTreesEquivalent,
    carKilometresEquivalent,
  };
}
