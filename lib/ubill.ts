// Regular utility bill calculator
// Ported from ubill.py - Ubill class

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
} from "./constants";

export interface UbillResult {
  month: number;
  year: number;
  usage: number;
  cost: number;
  // Zone breakdown
  usageGreenHigher: number;
  usageGreenLower: number;
  usageBlueHigher: number;
  usageBlueLower: number;
  usageRedHigher: number;
  usageRedLower: number;
}

/**
 * Calculate a regular (non-solar) utility bill for a given month
 *
 * @param month - Month number (1-12)
 * @param year - Year offset from current year (0 = current year, 1 = next year, etc.)
 * @param usage - Total kWh usage for the month
 * @param higherTariffPercent - Percentage of usage in higher (day) tariff (default 0.85)
 * @param permittedPower - Permitted power in kW (default 11.04)
 */
export function calculateUbill(
  month: number,
  year: number,
  usage: number,
  higherTariffPercent: number = 0.85,
  permittedPower: number = 11.04
): UbillResult {
  const usageHigherTariff = usage * higherTariffPercent;
  const usageLowerTariff = usage * (1 - higherTariffPercent);

  // Distribute usage across zones
  let usageGreenHigher = 0;
  let usageGreenLower = 0;
  let usageBlueHigher = 0;
  let usageBlueLower = 0;
  let usageRedHigher = 0;
  let usageRedLower = 0;

  if (usage <= GREEN_ZONE_LIMIT) {
    // All in green zone
    usageGreenHigher = usageHigherTariff;
    usageGreenLower = usageLowerTariff;
  } else if (usage <= BLUE_ZONE_LIMIT) {
    // Green + Blue zones
    usageGreenHigher = GREEN_ZONE_LIMIT * higherTariffPercent;
    usageGreenLower = GREEN_ZONE_LIMIT * (1 - higherTariffPercent);
    usageBlueHigher = (usage - GREEN_ZONE_LIMIT) * higherTariffPercent;
    usageBlueLower = (usage - GREEN_ZONE_LIMIT) * (1 - higherTariffPercent);
  } else {
    // All three zones
    usageGreenHigher = GREEN_ZONE_LIMIT * higherTariffPercent;
    usageGreenLower = GREEN_ZONE_LIMIT * (1 - higherTariffPercent);
    usageBlueHigher = (BLUE_ZONE_LIMIT - GREEN_ZONE_LIMIT) * higherTariffPercent;
    usageBlueLower = (BLUE_ZONE_LIMIT - GREEN_ZONE_LIMIT) * (1 - higherTariffPercent);
    usageRedHigher = (usage - BLUE_ZONE_LIMIT) * higherTariffPercent;
    usageRedLower = (usage - BLUE_ZONE_LIMIT) * (1 - higherTariffPercent);
  }

  // Calculate cost
  const priceMultiplier = Math.pow(1 + PERCENT_COST_INCREASE, year);

  // 1. Permitted power charge
  const obracunskaSnaga = permittedPower * PERMITTED_POWER_COST_PER_UNIT;

  // 2. Guaranteed supplier cost
  const trosakGarantovanogSnabdevaca = GUARANTEED_SUPPLIER_COST;

  // 3. Energy charges by zone
  const greenHigherCost = usageGreenHigher * GREEN_KWH_HIGH_COST * priceMultiplier;
  const greenLowerCost = usageGreenLower * GREEN_KWH_LOW_COST * priceMultiplier;
  const blueHigherCost = usageBlueHigher * BLUE_KWH_HIGH_COST * priceMultiplier;
  const blueLowerCost = usageBlueLower * BLUE_KWH_LOW_COST * priceMultiplier;
  const redHigherCost = usageRedHigher * RED_KWH_HIGH_COST * priceMultiplier;
  const redLowerCost = usageRedLower * RED_KWH_LOW_COST * priceMultiplier;

  // 4. Total energy charge
  const zaduzenjeZaElEnergiju =
    obracunskaSnaga +
    trosakGarantovanogSnabdevaca +
    greenHigherCost +
    greenLowerCost +
    blueHigherCost +
    blueLowerCost +
    redHigherCost +
    redLowerCost;

  // 8. Beneficial supplier subsidy fee
  const naknadaZaPodsticajPovlascenihProizvodjaca = usage * BENEFICIAL_SUPPLIER_SUBSIDY_FEE;

  // 9. Energy efficiency fee
  const naknadaZaEnergetskuEfikasnost = usage * ENERGY_EFFICIENCY_FEE;

  // 10. Excise tax base
  const osnovicaZaAkcizu =
    zaduzenjeZaElEnergiju +
    naknadaZaPodsticajPovlascenihProizvodjaca +
    naknadaZaEnergetskuEfikasnost;

  // 11. Excise tax
  const akciza = osnovicaZaAkcizu * EXCISE_TAX_PERCENT;

  // 12. VAT base
  const osnovicaZaPDV = osnovicaZaAkcizu + akciza;

  // 13. VAT
  const PDV = osnovicaZaPDV * VAT_TAX_PERCENT;

  // 15. Total charge
  const ukupnoZaduzenje = osnovicaZaPDV + PDV;

  // 16. Final total with TV tax
  const total = ukupnoZaduzenje + TV_TAX;

  return {
    month,
    year,
    usage,
    cost: Math.round(total),
    usageGreenHigher,
    usageGreenLower,
    usageBlueHigher,
    usageBlueLower,
    usageRedHigher,
    usageRedLower,
  };
}
