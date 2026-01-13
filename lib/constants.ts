// Serbian electricity tariff constants
// Ported from ubill.py

// Annual price increase assumption
export const PERCENT_COST_INCREASE = 0.05;

// Fixed charges
export const PERMITTED_POWER_COST_PER_UNIT = 54.258; // RSD per kW
export const GUARANTEED_SUPPLIER_COST = 146.521; // RSD fixed monthly

// Consumption zone thresholds (kWh per month)
export const GREEN_ZONE_LIMIT = 350;
export const BLUE_ZONE_LIMIT = 1200;

// Zone pricing - Higher tariff (day)
export const GREEN_KWH_HIGH_COST = 9.6136; // RSD per kWh
export const BLUE_KWH_HIGH_COST = 14.4203;
export const RED_KWH_HIGH_COST = 28.8407;

// Zone pricing - Lower tariff (night)
export const GREEN_KWH_LOW_COST = 2.4034;
export const BLUE_KWH_LOW_COST = 3.6051;
export const RED_KWH_LOW_COST = 7.2102;

// Fees and taxes
export const BENEFICIAL_SUPPLIER_SUBSIDY_FEE = 0.801; // RSD per kWh
export const ENERGY_EFFICIENCY_FEE = 0.015; // RSD per kWh
export const EXCISE_TAX_PERCENT = 0.075; // 7.5%
export const VAT_TAX_PERCENT = 0.2; // 20%
export const TV_TAX = 300; // RSD fixed monthly

// Solar-specific charges
export const SOLAR_HIGHER_KWH_COST = 3.879;
export const SOLAR_LOWER_KWH_COST = 0.97;
export const DISTRIBUTED_SYSTEM_CHARGE_PER_KWH = 3.897;

// CO2 constants
export const SERBIA_PERCENT_FROM_COAL = 0.7;
export const SERBIA_PERCENT_FROM_HYDRO = 0.3;
export const KG_OF_CO2_PER_KWH_COAL = 0.9;
export const KG_OF_CO2_PER_KWH_HYDRO = 0.024;
export const KG_OF_CO2_PER_KWH_SOLAR = 0.04;
export const ADULT_TREE_ABSORPTION_KG_YEAR = 50;
export const CO2_CAR_PER_100_KM = 13.4;

// PVGIS API
export const PVGIS_LOSS_PERCENT = 14; // System losses
