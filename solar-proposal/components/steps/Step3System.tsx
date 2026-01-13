"use client";

import { useProposal } from "@/context/proposal-context";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { BillComparisonChart } from "@/components/charts/BillComparisonChart";
import { calculateSweetSpot } from "@/lib/calculations";

const PANEL_POWER_OPTIONS = [
  { value: 400, label: "400W" },
  { value: 410, label: "410W" },
  { value: 420, label: "420W" },
  { value: 440, label: "440W" },
  { value: 450, label: "450W" },
  { value: 500, label: "500W" },
  { value: 550, label: "550W" },
];

export function Step3System() {
  const {
    data,
    setPanelPower,
    setAssignedPanels,
    nextStep,
    prevStep,
  } = useProposal();

  // Calculate sweet spot recommendation
  // Uses productionPerKwp from PVGIS API (kWh produced per kWp installed per year)
  const recommendation = data.productionPerKwp && data.utility.annualUsage > 0
    ? calculateSweetSpot(
        data.utility.monthlyUsage,
        data.utility.higherTariffPercent,
        data.productionPerKwp,
        data.system.panelPower
      )
    : null;

  const totalAssigned = data.roofSurfaces.reduce((sum, s) => sum + s.assignedPanels, 0);
  const totalMaxPanels = data.roofSurfaces.reduce((sum, s) => sum + s.maxPanels, 0);
  const canProceed = totalAssigned > 0;

  return (
    <div className="space-y-6">
      {/* Panel Configuration Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-800">⚙️ Konfiguracija sistema</h2>
          <p className="text-sm text-slate-500 mt-1">
            Izaberite snagu panela i rasporedite ih po krovnim površinama
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Panel power selector */}
          <div className="max-w-xs">
            <Select
              label="Snaga panela"
              value={data.system.panelPower}
              onChange={(e) => setPanelPower(parseInt(e.target.value))}
              options={PANEL_POWER_OPTIONS}
            />
          </div>

          {/* Recommendation banner */}
          {recommendation && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-solar-yellow rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Preporučena konfiguracija</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Za vašu potrošnju, optimalna snaga sistema je{" "}
                    <span className="font-bold text-solar-blue">
                      {recommendation.powerKw.optimal} kW
                    </span>{" "}
                    ({recommendation.panels.optimal} panela × {data.system.panelPower}W).
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Ovo pokriva vašu plavu i crvenu zonu potrošnje, maksimizujući ROI.
                    Preporučeni opseg: {recommendation.panels.min}-{recommendation.panels.max} panela.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Surface panel assignment */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Rasporedite panele po površinama</h3>
            {data.roofSurfaces.map((surface) => (
              <div
                key={surface.id}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-slate-800">{surface.name}</span>
                    <span className="text-sm text-slate-500 ml-2">
                      (max {surface.maxPanels} panela)
                    </span>
                  </div>
                  <span className="text-sm font-medium text-solar-blue">
                    {((surface.assignedPanels * data.system.panelPower) / 1000).toFixed(1)} kW
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={surface.maxPanels}
                    value={surface.assignedPanels}
                    onChange={(e) =>
                      setAssignedPanels(surface.id, parseInt(e.target.value))
                    }
                    className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-yellow"
                  />
                  <div className="flex items-center gap-2 w-32">
                    <button
                      onClick={() =>
                        setAssignedPanels(surface.id, Math.max(0, surface.assignedPanels - 1))
                      }
                      className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-lg">
                      {surface.assignedPanels}
                    </span>
                    <button
                      onClick={() =>
                        setAssignedPanels(
                          surface.id,
                          Math.min(surface.maxPanels, surface.assignedPanels + 1)
                        )
                      }
                      className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-solar-yellow transition-all duration-300"
                    style={{
                      width: `${(surface.assignedPanels / surface.maxPanels) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-solar-blue/5 rounded-lg border border-solar-blue/20">
            <div className="text-center">
              <span className="text-sm text-slate-600 block">Ukupno panela</span>
              <span className="text-3xl font-bold text-solar-blue">{totalAssigned}</span>
              <span className="text-sm text-slate-500"> / {totalMaxPanels}</span>
            </div>
            <div className="text-center">
              <span className="text-sm text-slate-600 block">Ukupna snaga</span>
              <span className="text-3xl font-bold text-solar-blue">
                {data.system.totalPowerKw.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500"> kW</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Card */}
      {data.results && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-800">📊 Pregled mesečnih računa</h2>
            <p className="text-sm text-slate-500 mt-1">
              Poređenje računa pre i posle instalacije solarnih panela
            </p>
          </CardHeader>
          <CardContent>
            <BillComparisonChart
              preSolar={data.results.monthlyBillsPreSolar}
              postSolar={data.results.monthlyBillsPostSolar}
            />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">Godišnje pre solara</span>
                <span className="text-lg font-bold text-slate-700">
                  {data.results.annualCostPreSolar.toLocaleString("sr-RS")} RSD
                </span>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <span className="text-xs text-slate-500 block">Godišnje sa solarom</span>
                <span className="text-lg font-bold text-green-700">
                  {data.results.annualCostPostSolar.toLocaleString("sr-RS")} RSD
                </span>
              </div>
              <div className="text-center p-3 bg-solar-yellow/20 rounded-lg">
                <span className="text-xs text-slate-500 block">Godišnja ušteda</span>
                <span className="text-lg font-bold text-solar-blue">
                  {data.results.annualSavings.toLocaleString("sr-RS")} RSD
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline">
          ← Nazad
        </Button>
        <Button onClick={nextStep} disabled={!canProceed} size="lg">
          Dalje: Cena i rezultati →
        </Button>
      </div>
    </div>
  );
}
