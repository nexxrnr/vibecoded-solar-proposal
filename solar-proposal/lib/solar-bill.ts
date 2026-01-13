// Solar utility bill calculator with net metering
// Ported from ubill.py - SolarBill class

import {
  PERCENT_COST_INCREASE,
  PERMITTED_POWER_COST_PER_UNIT,
  GUARANTEED_SUPPLIER_COST,
  GREEN_ZONE_LIMIT,
  BLUE_ZONE_LIMIT,
  GREEN_KWH_HIGH_COST,
  GREEN_KWH_LOW_COST,
  BLUE_KWH_HIGH_COST,
  BLUE_KWH_LOW_COST,
  RED_KWH_HIGH_COST,
  RED_KWH_LOW_COST,
  BENEFICIAL_SUPPLIER_SUBSIDY_FEE,
  ENERGY_EFFICIENCY_FEE,
  EXCISE_TAX_PERCENT,
  VAT_TAX_PERCENT,
  TV_TAX,
  DISTRIBUTED_SYSTEM_CHARGE_PER_KWH,
} from "./constants";

export interface SolarBillResult {
  month: number;
  year: number;
  usage: number;
  production: number;
  cost: number;
  excessForNextMonth: number;
  // Detailed breakdown
  kwhOfSolarUsedOnSpot: number;
  kwhExported: number;
  kwhImported: number;
  netHigherUsage: number;
  netLowerUsage: number;
  netTotal: number;
}

/**
 * Calculate how much solar is used on-site (not exported)
 * Model: 40% of production is used on spot, capped at 60% of day usage
 */
function calculateKwhOfSolarUsedOnSpot(
  production: number,
  higherTariffUsage: number
): number {
  const fortyPercentOfProduction = 0.4 * production;
  const sixtyPercentOfUsage = 0.6 * higherTariffUsage;

  return Math.min(fortyPercentOfProduction, sixtyPercentOfUsage);
}

/**
 * Calculate excess energy to carry over to next month
 */
function calculateExcessForNextMonth(
  month: number,
  excessFromPreviousMonth: number,
  production: number,
  usage: number
): number {
  // March is the reset month - excess resets to 0
  if (month === 3) {
    return 0;
  }

  const excess = excessFromPreviousMonth + production - usage;
  return excess > 0 ? excess : 0;
}

/**
 * Calculate a solar utility bill for a given month with net metering
 *
 * @param month - Month number (1-12)
 * @param year - Year offset from current year (0 = current year, 1 = next year, etc.)
 * @param usage - Total kWh usage for the month
 * @param production - Solar production for the month in kWh
 * @param excessFromPreviousMonth - Excess kWh carried over from previous month
 * @param higherTariffPercent - Percentage of usage in higher (day) tariff (default 0.85)
 * @param permittedPower - Permitted power in kW (default 11.04)
 */
export function calculateSolarBill(
  month: number,
  year: number,
  usage: number,
  production: number,
  excessFromPreviousMonth: number = 0,
  higherTariffPercent: number = 0.85,
  permittedPower: number = 11.04
): SolarBillResult {
  const higherTariffUsage = higherTariffPercent * usage;
  const lowerTariffUsage = (1 - higherTariffPercent) * usage;

  // Calculate on-site usage and energy flows
  const kwhOfSolarUsedOnSpot = calculateKwhOfSolarUsedOnSpot(production, higherTariffUsage);
  const kwhExported = production - kwhOfSolarUsedOnSpot;
  const kwhImported = higherTariffUsage - kwhOfSolarUsedOnSpot;

  // Net higher tariff usage after applying exported energy and previous excess
  let netHigherUsage = kwhImported - kwhExported - excessFromPreviousMonth;
  if (netHigherUsage < 0) {
    netHigherUsage = 0;
  }

  // DS surcharge calculation
  const dsSurchargeKwh = kwhImported - netHigherUsage;

  // Calculate excess for next month
  const excessForNextMonth = calculateExcessForNextMonth(
    month,
    excessFromPreviousMonth,
    production,
    usage
  );

  // Lower tariff is not affected by solar
  const netLowerUsage = lowerTariffUsage;
  const netTotal = netHigherUsage + netLowerUsage;

  // Calculate tariff percentages for net usage
  let netHigherTariffPercent: number;
  let netLowerTariffPercent: number;

  if (netHigherUsage === 0 && netLowerUsage === 0) {
    netHigherTariffPercent = 0;
    netLowerTariffPercent = 1;
  } else if (netHigherUsage === 0) {
    netHigherTariffPercent = 0;
    netLowerTariffPercent = 1;
  } else if (netLowerUsage === 0) {
    netHigherTariffPercent = 1;
    netLowerTariffPercent = 0;
  } else {
    netHigherTariffPercent = netHigherUsage / netTotal;
    netLowerTariffPercent = 1 - netHigherTariffPercent;
  }

  // Distribute net usage across zones
  let netGreenHigherTariff = 0;
  let netGreenLowerTariff = 0;
  let netBlueHigherTariff = 0;
  let netBlueLowerTariff = 0;
  let netRedHigherTariff = 0;
  let netRedLowerTariff = 0;

  if (netTotal < GREEN_ZONE_LIMIT) {
    netGreenHigherTariff = netHigherUsage;
    netGreenLowerTariff = netLowerUsage;
  } else if (netTotal < BLUE_ZONE_LIMIT) {
    netGreenHigherTariff = GREEN_ZONE_LIMIT * netHigherTariffPercent;
    netGreenLowerTariff = GREEN_ZONE_LIMIT * (1 - netHigherTariffPercent);
    netBlueHigherTariff = (netTotal - GREEN_ZONE_LIMIT) * netHigherTariffPercent;
    netBlueLowerTariff = (netTotal - GREEN_ZONE_LIMIT) * (1 - netHigherTariffPercent);
  } else {
    netGreenHigherTariff = GREEN_ZONE_LIMIT * netHigherTariffPercent;
    netGreenLowerTariff = GREEN_ZONE_LIMIT * (1 - netHigherTariffPercent);
    netBlueHigherTariff = (BLUE_ZONE_LIMIT - GREEN_ZONE_LIMIT) * netHigherTariffPercent;
    netBlueLowerTariff = (BLUE_ZONE_LIMIT - GREEN_ZONE_LIMIT) * (1 - netHigherTariffPercent);
    netRedHigherTariff = (netTotal - BLUE_ZONE_LIMIT) * netHigherTariffPercent;
    netRedLowerTariff = (netTotal - BLUE_ZONE_LIMIT) * (1 - netHigherTariffPercent);
  }

  // Calculate cost
  const priceMultiplier = Math.pow(1 + PERCENT_COST_INCREASE, year);

  // 1. Permitted power charge
  const obracunskaSnaga = permittedPower * PERMITTED_POWER_COST_PER_UNIT;

  // 2. Guaranteed supplier cost
  const trosakGarantovanogSnabdevaca = GUARANTEED_SUPPLIER_COST;

  // 3. Energy charges by zone (net usage)
  const utrosenaEnergijaZbir =
    netGreenHigherTariff * GREEN_KWH_HIGH_COST * priceMultiplier +
    netGreenLowerTariff * GREEN_KWH_LOW_COST * priceMultiplier +
    netBlueHigherTariff * BLUE_KWH_HIGH_COST * priceMultiplier +
    netBlueLowerTariff * BLUE_KWH_LOW_COST * priceMultiplier +
    netRedHigherTariff * RED_KWH_HIGH_COST * priceMultiplier +
    netRedLowerTariff * RED_KWH_LOW_COST * priceMultiplier;

  // 5. Beneficial supplier fee (on exported energy)
  const naknadaZaPovlascene = kwhExported * BENEFICIAL_SUPPLIER_SUBSIDY_FEE;

  // 6. Energy efficiency fee (on exported energy)
  const naknadaZaEfikasnost = kwhExported * ENERGY_EFFICIENCY_FEE;

  // 7. Distributed system charge
  const naknadaZaDS =
    (kwhImported - netHigherUsage) * DISTRIBUTED_SYSTEM_CHARGE_PER_KWH * priceMultiplier;

  // 8. Excise tax base
  const osnovicaZaAkcizu =
    obracunskaSnaga +
    trosakGarantovanogSnabdevaca +
    utrosenaEnergijaZbir +
    naknadaZaPovlascene +
    naknadaZaEfikasnost +
    naknadaZaDS;

  // 9. Excise tax
  const akcizaIznos = osnovicaZaAkcizu * EXCISE_TAX_PERCENT;

  // 10. VAT base
  const osnovicaZaPDV = osnovicaZaAkcizu + akcizaIznos;

  // 11. VAT
  const PDVIznos = osnovicaZaPDV * VAT_TAX_PERCENT;

  // Total charge
  const ukupnoZaduzenje = osnovicaZaPDV + PDVIznos;

  // Final total with TV tax
  const totalCost = ukupnoZaduzenje + TV_TAX;

  return {
    month,
    year,
    usage,
    production,
    cost: Math.round(totalCost),
    excessForNextMonth,
    kwhOfSolarUsedOnSpot,
    kwhExported,
    kwhImported,
    netHigherUsage,
    netLowerUsage,
    netTotal,
  };
}
