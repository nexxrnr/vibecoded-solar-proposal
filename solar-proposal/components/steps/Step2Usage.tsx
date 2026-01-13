"use client";

import { useState, useEffect } from "react";
import { useProposal } from "@/context/proposal-context";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MonthlyUsage } from "@/lib/types";

const MONTHS = [
  { num: 1, name: "Januar", short: "Jan" },
  { num: 2, name: "Februar", short: "Feb" },
  { num: 3, name: "Mart", short: "Mar" },
  { num: 4, name: "April", short: "Apr" },
  { num: 5, name: "Maj", short: "Maj" },
  { num: 6, name: "Jun", short: "Jun" },
  { num: 7, name: "Jul", short: "Jul" },
  { num: 8, name: "Avgust", short: "Avg" },
  { num: 9, name: "Septembar", short: "Sep" },
  { num: 10, name: "Oktobar", short: "Okt" },
  { num: 11, name: "Novembar", short: "Nov" },
  { num: 12, name: "Decembar", short: "Dec" },
];

// Distribution patterns based on usage profile
// Each array represents relative weights for Jan-Dec
const DISTRIBUTION_WEIGHTS = {
  // Flat/balanced (no AC, no electric heating)
  flat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  
  // Summer AC usage - higher in June, July, August
  summerAC: [7, 7, 7, 8, 9, 13, 15, 15, 10, 7, 7, 7],
  
  // Winter electric heating - higher in Nov, Dec, Jan, Feb
  winterHeat: [14, 13, 9, 7, 6, 5, 5, 5, 6, 8, 12, 14],
  
  // Both AC and heating - peaks in summer AND winter
  both: [12, 11, 8, 6, 7, 11, 13, 13, 8, 6, 10, 11],
};

function distributeAnnualUsage(
  annualUsage: number,
  hasAC: boolean,
  hasElectricHeat: boolean
): MonthlyUsage {
  // Select the appropriate weight pattern
  let weights: number[];
  if (hasAC && hasElectricHeat) {
    weights = DISTRIBUTION_WEIGHTS.both;
  } else if (hasAC) {
    weights = DISTRIBUTION_WEIGHTS.summerAC;
  } else if (hasElectricHeat) {
    weights = DISTRIBUTION_WEIGHTS.winterHeat;
  } else {
    weights = DISTRIBUTION_WEIGHTS.flat;
  }

  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Distribute and round
  const distributed: MonthlyUsage = {};
  let runningTotal = 0;
  
  for (let month = 1; month <= 12; month++) {
    if (month === 12) {
      // Last month gets whatever is left to ensure exact total
      distributed[month] = annualUsage - runningTotal;
    } else {
      distributed[month] = Math.round((annualUsage * weights[month - 1]) / totalWeight);
      runningTotal += distributed[month];
    }
  }
  
  return distributed;
}

export function Step2Usage() {
  const {
    data,
    setMonthlyUsage,
    setHigherTariffPercent,
    setPermittedPower,
    fetchProductionData,
    isLoading,
    error,
    nextStep,
    prevStep,
  } = useProposal();

  const [inputMode, setInputMode] = useState<"monthly" | "annual">("annual");
  const [annualUsage, setAnnualUsage] = useState(data.utility.annualUsage || 0);
  const [localMonthly, setLocalMonthly] = useState<MonthlyUsage>(data.utility.monthlyUsage);
  
  // Usage profile checkboxes
  const [hasAC, setHasAC] = useState(false);
  const [hasElectricHeat, setHasElectricHeat] = useState(false);

  // Distribute annual usage across months based on profile
  // This preserves the EXACT total the user entered
  useEffect(() => {
    if (inputMode === "annual" && annualUsage > 0) {
      const distributed = distributeAnnualUsage(annualUsage, hasAC, hasElectricHeat);
      setLocalMonthly(distributed);
      setMonthlyUsage(distributed);
    }
  }, [annualUsage, inputMode, hasAC, hasElectricHeat, setMonthlyUsage]);

  const handleMonthlyChange = (month: number, value: number) => {
    const updated = { ...localMonthly, [month]: value };
    setLocalMonthly(updated);
    setMonthlyUsage(updated);
  };

  const totalUsage = Object.values(localMonthly).reduce((sum, val) => sum + val, 0);
  const canProceed = totalUsage > 0;

  const handleNext = async () => {
    // Ensure monthly usage is saved to context before proceeding
    setMonthlyUsage(localMonthly);
    await fetchProductionData();
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Usage Input Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-800">⚡ Potrošnja električne energije</h2>
          <p className="text-sm text-slate-500 mt-1">
            Unesite mesečnu potrošnju iz računa za struju (u kWh)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input mode toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              onClick={() => setInputMode("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === "monthly"
                  ? "bg-white text-solar-blue shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Mesečno
            </button>
            <button
              onClick={() => setInputMode("annual")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === "annual"
                  ? "bg-white text-solar-blue shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Godišnje
            </button>
          </div>

          {inputMode === "annual" ? (
            <div className="space-y-5">
              <div className="max-w-md">
                <Input
                  label="Ukupna godišnja potrošnja"
                  type="number"
                  min={0}
                  value={annualUsage || ""}
                  onChange={(e) => setAnnualUsage(parseInt(e.target.value) || 0)}
                  suffix="kWh"
                  hint="Možete pronaći na godišnjem računu ili sabrati 12 meseci"
                />
              </div>

              {/* Usage profile checkboxes */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-medium text-slate-700 mb-3">
                  Profil potrošnje
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    (utiče na raspodelu po mesecima)
                  </span>
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasAC}
                      onChange={(e) => setHasAC(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-solar-yellow focus:ring-solar-yellow cursor-pointer"
                    />
                    <div>
                      <span className="font-medium text-slate-700 group-hover:text-solar-blue transition-colors">
                        ❄️ Koristimo klimu leti
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Povećava potrošnju tokom letnjih meseci (jun, jul, avgust)
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasElectricHeat}
                      onChange={(e) => setHasElectricHeat(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-solar-yellow focus:ring-solar-yellow cursor-pointer"
                    />
                    <div>
                      <span className="font-medium text-slate-700 group-hover:text-solar-blue transition-colors">
                        🔥 Grejemo se na struju zimi
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Povećava potrošnju tokom zimskih meseci (nov, dec, jan, feb)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Visual distribution preview */}
              {annualUsage > 0 && (
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Raspodela po mesecima:</h4>
                  <div className="flex items-end gap-1 h-24">
                    {MONTHS.map((month) => {
                      const value = localMonthly[month.num] || 0;
                      const maxValue = Math.max(...Object.values(localMonthly));
                      const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      const isSummer = [6, 7, 8].includes(month.num);
                      const isWinter = [12, 1, 2].includes(month.num);
                      
                      return (
                        <div key={month.num} className="flex-1 flex flex-col items-center">
                          <div
                            className={`w-full rounded-t transition-all ${
                              isSummer && hasAC
                                ? "bg-orange-400"
                                : isWinter && hasElectricHeat
                                ? "bg-blue-400"
                                : "bg-solar-yellow"
                            }`}
                            style={{ height: `${heightPercent}%`, minHeight: value > 0 ? "4px" : "0" }}
                            title={`${month.name}: ${value} kWh`}
                          />
                          <span className="text-[10px] text-slate-500 mt-1">{month.short}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-4 mt-3 text-xs">
                    {hasAC && (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-orange-400 rounded"></span>
                        Leto (klima)
                      </span>
                    )}
                    {hasElectricHeat && (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-blue-400 rounded"></span>
                        Zima (grejanje)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTHS.map((month) => (
                <div key={month.num}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {month.name}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={localMonthly[month.num] || ""}
                      onChange={(e) =>
                        handleMonthlyChange(month.num, parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-solar-yellow focus:ring-2 focus:ring-solar-yellow/30"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      kWh
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-solar-blue/5 rounded-lg border border-solar-blue/20">
            <span className="text-slate-700 font-medium">Ukupna godišnja potrošnja:</span>
            <span className="text-2xl font-bold text-solar-blue">
              {totalUsage.toLocaleString("sr-RS")} kWh
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tariff Settings Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-800">📊 Podešavanja tarife</h2>
          <p className="text-sm text-slate-500 mt-1">
            Napredna podešavanja (opciono)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Procenat više tarife (dnevna)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={data.utility.higherTariffPercent * 100}
                  onChange={(e) => setHigherTariffPercent(parseInt(e.target.value) / 100)}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-yellow"
                />
                <span className="w-14 text-center font-semibold text-solar-blue">
                  {Math.round(data.utility.higherTariffPercent * 100)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Tipično 80-90% potrošnje je tokom dana
              </p>
            </div>
            <Input
              label="Dozvoljena snaga priključka"
              type="number"
              step={0.01}
              min={0}
              value={data.utility.permittedPower}
              onChange={(e) => setPermittedPower(parseFloat(e.target.value) || 0)}
              suffix="kW"
              hint="Standardno 11.04 kW za domaćinstva"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Greška pri učitavanju podataka:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline">
          ← Nazad
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} isLoading={isLoading} size="lg">
          {isLoading ? "Učitavanje podataka o suncu..." : "Dalje: Konfiguracija sistema →"}
        </Button>
      </div>
    </div>
  );
}
