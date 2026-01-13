"use client";

import { useState, useEffect } from "react";
import { useProposal } from "@/context/proposal-context";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BillComparisonChart } from "@/components/charts/BillComparisonChart";
import { ROITimelineChart } from "@/components/charts/ROITimelineChart";
import { CoverageChart } from "@/components/charts/CoverageChart";

const DEFAULT_PRICE_PER_WATT = 55; // RSD per Wp
const MIN_PRICE_PER_WATT = 35;
const MAX_PRICE_PER_WATT = 80;

export function Step4Results() {
  const { data, setSystemCost, prevStep } = useProposal();
  
  // Calculate total watts
  const totalWatts = data.system.totalPanels * data.system.panelPower;
  
  // Price per watt state - derived from cost or set by slider
  const [pricePerWatt, setPricePerWatt] = useState(DEFAULT_PRICE_PER_WATT);
  
  // Initialize cost based on default price per watt when component mounts
  useEffect(() => {
    if (data.system.cost === 0 && totalWatts > 0) {
      setSystemCost(totalWatts * DEFAULT_PRICE_PER_WATT);
    }
  }, [totalWatts, data.system.cost, setSystemCost]);
  
  // Update price per watt when cost changes externally
  useEffect(() => {
    if (totalWatts > 0 && data.system.cost > 0) {
      const calculatedPPW = Math.round(data.system.cost / totalWatts);
      if (Math.abs(calculatedPPW - pricePerWatt) > 1) {
        setPricePerWatt(calculatedPPW);
      }
    }
  }, [data.system.cost, totalWatts, pricePerWatt]);
  
  // Handle price per watt slider change
  const handlePricePerWattChange = (newPPW: number) => {
    setPricePerWatt(newPPW);
    setSystemCost(totalWatts * newPPW);
  };
  
  // Handle direct cost input change
  const handleCostChange = (newCost: number) => {
    setSystemCost(newCost);
    if (totalWatts > 0) {
      setPricePerWatt(Math.round(newCost / totalWatts));
    }
  };

  // Results are auto-calculated when cost changes
  const results = data.results;

  return (
    <div className="space-y-6">
      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-800">💰 Cena sistema</h2>
          <p className="text-sm text-slate-500 mt-1">
            Podesite cenu sistema - {data.system.totalPanels} panela × {data.system.panelPower}W = {data.system.totalPowerKw.toFixed(1)} kW
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price per Watt slider */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cena po vatu (RSD/Wp): <span className="text-solar-blue font-bold">{pricePerWatt} RSD/Wp</span>
            </label>
            <input
              type="range"
              min={MIN_PRICE_PER_WATT}
              max={MAX_PRICE_PER_WATT}
              value={pricePerWatt}
              onChange={(e) => handlePricePerWattChange(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-yellow"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{MIN_PRICE_PER_WATT} RSD/Wp</span>
              <span className="text-solar-blue font-medium">Tipično: 50-60 RSD/Wp</span>
              <span>{MAX_PRICE_PER_WATT} RSD/Wp</span>
            </div>
          </div>

          {/* Total cost display and input */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-solar-yellow/20 to-amber-100 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ukupna cena sistema
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={data.system.cost || ""}
                  onChange={(e) => handleCostChange(parseInt(e.target.value) || 0)}
                  className="w-48 px-4 py-2 text-xl font-bold rounded-lg border border-slate-300 focus:border-solar-yellow focus:ring-2 focus:ring-solar-yellow/30"
                />
                <span className="text-lg font-medium text-slate-600">RSD</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-slate-500 block">Cena po kW</span>
              <span className="text-2xl font-bold text-solar-blue">
                {data.system.totalPowerKw > 0 
                  ? Math.round(data.system.cost / data.system.totalPowerKw).toLocaleString("sr-RS")
                  : 0} 
              </span>
              <span className="text-sm text-slate-600"> RSD/kW</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && data.system.cost > 0 && (
        <>
          {/* ROI Summary Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-800">📈 Povrat investicije (ROI)</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-solar-yellow/20 to-amber-100 rounded-xl">
                  <span className="text-xs text-slate-600 block mb-1">Vreme povrata</span>
                  <span className="text-2xl font-bold text-solar-blue block">
                    {results.breakEvenYears}
                  </span>
                  <span className="text-sm text-slate-600">
                    god. {results.breakEvenExtraMonths > 0 && `i ${results.breakEvenExtraMonths} mes.`}
                  </span>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <span className="text-xs text-slate-600 block mb-1">Godišnja ušteda</span>
                  <span className="text-2xl font-bold text-green-700 block">
                    {(results.annualSavings / 1000).toFixed(0)}k
                  </span>
                  <span className="text-sm text-slate-600">RSD</span>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <span className="text-xs text-slate-600 block mb-1">Godina u profitu</span>
                  <span className="text-2xl font-bold text-blue-700 block">
                    {results.yearsInProfit}
                  </span>
                  <span className="text-sm text-slate-600">od 25 godina</span>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl">
                  <span className="text-xs text-slate-600 block mb-1">Pokrivenost</span>
                  <span className="text-2xl font-bold text-purple-700 block">
                    {Math.round(results.solarPercentageOfUsage)}%
                  </span>
                  <span className="text-sm text-slate-600">potrošnje</span>
                </div>
              </div>
              
              <ROITimelineChart
                systemCost={data.system.cost}
                annualSavings={results.annualSavings}
                breakEvenYears={results.breakEvenYears}
              />
            </CardContent>
          </Card>

          {/* Bill Comparison Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-800">📊 Mesečni računi</h2>
              <p className="text-sm text-slate-500 mt-1">
                Poređenje računa pre i posle instalacije
              </p>
            </CardHeader>
            <CardContent>
              <BillComparisonChart
                preSolar={results.monthlyBillsPreSolar}
                postSolar={results.monthlyBillsPostSolar}
              />
            </CardContent>
          </Card>

          {/* Coverage & CO2 Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-slate-800">☀️ Pokrivenost solarom</h2>
              </CardHeader>
              <CardContent>
                <CoverageChart
                  solarPercent={results.solarPercentageOfUsage}
                  gridPercent={results.importPercentageOfUsage}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-slate-800">🌱 Ekološki uticaj</h2>
                <p className="text-sm text-slate-500">Godišnja redukcija CO₂</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      🌍
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-green-700">
                        {results.co2ReductionKg.toLocaleString("sr-RS")}
                      </span>
                      <span className="text-sm text-slate-600 ml-1">kg CO₂ manje</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                      🌳
                    </div>
                    <div>
                      <span className="text-xl font-bold text-emerald-700">
                        {results.treesEquivalent}
                      </span>
                      <span className="text-sm text-slate-600 ml-1">zasađenih stabala</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-teal-50 rounded-lg">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl">
                      🚗
                    </div>
                    <div>
                      <span className="text-xl font-bold text-teal-700">
                        {results.carKmEquivalent.toLocaleString("sr-RS")}
                      </span>
                      <span className="text-sm text-slate-600 ml-1">km manje vožnje</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Banner */}
          <div className="p-6 bg-gradient-to-r from-solar-blue to-solar-blue-light rounded-xl text-white">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Rezime ponude</h3>
              <p className="text-3xl font-bold text-solar-yellow mb-1">
                {data.system.totalPowerKw.toFixed(1)} kW sistem
              </p>
              <p className="text-lg opacity-90">
                {data.system.totalPanels} panela × {data.system.panelPower}W
              </p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-lg">
                  Povrat investicije za{" "}
                  <span className="font-bold text-solar-yellow">{results.breakEvenString}</span>
                </p>
                <p className="text-sm opacity-80 mt-1">
                  Zatim {results.yearsInProfit} godina čistog profita
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline">
          ← Nazad
        </Button>
        <Button variant="secondary" disabled={!results || data.system.cost === 0}>
          📄 Generiši PDF (uskoro)
        </Button>
      </div>
    </div>
  );
}
