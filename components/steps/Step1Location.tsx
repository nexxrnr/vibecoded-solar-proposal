"use client";

import { useState } from "react";
import { useProposal } from "@/context/proposal-context";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ORIENTATION_OPTIONS } from "@/lib/types";
import {
  SERBIAN_CITIES,
  SLOPE_OPTIONS,
  DEFAULT_SLOPE,
  DEFAULT_SHADING,
  DEFAULT_MAX_PANELS,
} from "@/lib/serbia-cities";

export function Step1Location() {
  const {
    data,
    setCoordinates,
    addRoofSurface,
    updateRoofSurface,
    removeRoofSurface,
    nextStep,
  } = useProposal();

  const [selectedCity, setSelectedCity] = useState(SERBIAN_CITIES[0].name);
  const [newSurface, setNewSurface] = useState({
    orientation: 0,
    slope: DEFAULT_SLOPE,
    shading: DEFAULT_SHADING,
    maxPanels: DEFAULT_MAX_PANELS,
  });

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const city = SERBIAN_CITIES.find((c) => c.name === cityName);
    if (city) {
      setCoordinates(city.lat, city.lon);
    }
  };

  const handleAddSurface = () => {
    if (newSurface.maxPanels > 0) {
      addRoofSurface({
        name: `Krov ${data.roofSurfaces.length + 1}`,
        orientation: newSurface.orientation,
        slope: newSurface.slope,
        shading: newSurface.shading / 100,
        maxPanels: newSurface.maxPanels,
      });
      // Reset to defaults for next surface
      setNewSurface({
        orientation: 0,
        slope: DEFAULT_SLOPE,
        shading: DEFAULT_SHADING,
        maxPanels: DEFAULT_MAX_PANELS,
      });
    }
  };

  const canProceed = data.roofSurfaces.length > 0;

  return (
    <div className="space-y-6">
      {/* Location Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-800">📍 Lokacija</h2>
          <p className="text-sm text-slate-500 mt-1">
            Izaberite grad ili najbliži grad vašoj lokaciji
          </p>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select
              label="Grad"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              options={SERBIAN_CITIES.map((city) => ({
                value: city.name,
                label: city.name,
              }))}
            />
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ukoliko vaš grad nije na listi, izaberite najbliži grad. Razlike u solarnoj proizvodnji su minimalne.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Roof Surfaces Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-800">🏠 Krovne površine</h2>
          <p className="text-sm text-slate-500 mt-1">
            Dodajte jednu ili više krovnih površina za solarne panele
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing surfaces */}
          {data.roofSurfaces.length > 0 && (
            <div className="space-y-3">
              {data.roofSurfaces.map((surface, index) => (
                <div
                  key={surface.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-amber-50/30 rounded-lg border border-slate-200"
                >
                  <div className="w-10 h-10 bg-solar-yellow rounded-full flex items-center justify-center font-bold text-solar-blue">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-xs text-slate-500 block">Orijentacija</span>
                      <span className="font-medium text-slate-700">
                        {ORIENTATION_OPTIONS.find((o) => o.value === surface.orientation)?.label ||
                          `${surface.orientation}°`}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Nagib</span>
                      <span className="font-medium text-slate-700">
                        {SLOPE_OPTIONS.find((s) => s.value === surface.slope)?.label || `${surface.slope}°`}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Zasenjenje</span>
                      <span className="font-medium text-slate-700">
                        {Math.round(surface.shading * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Max panela</span>
                      <span className="font-medium text-slate-700">{surface.maxPanels}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeRoofSurface(surface.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Ukloni površinu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new surface form */}
          <div className="p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm">+</span>
              Dodaj novu površinu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Orientation */}
              <Select
                label="Orijentacija krova"
                value={newSurface.orientation}
                onChange={(e) =>
                  setNewSurface({ ...newSurface, orientation: parseInt(e.target.value) })
                }
                options={ORIENTATION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />

              {/* Slope - now a dropdown */}
              <Select
                label="Nagib krova"
                value={newSurface.slope}
                onChange={(e) =>
                  setNewSurface({ ...newSurface, slope: parseInt(e.target.value) })
                }
                options={SLOPE_OPTIONS}
              />

              {/* Shading - now a slider */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Zasenjenje: <span className="text-solar-blue font-bold">{newSurface.shading}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={newSurface.shading}
                  onChange={(e) =>
                    setNewSurface({ ...newSurface, shading: parseInt(e.target.value) })
                  }
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-yellow"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0% - Bez senke</span>
                  <span>50% - Dosta senke</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Uključuje senku od drveća, dimnjaka, susednih zgrada, itd.
                </p>
              </div>

              {/* Max panels */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Maksimalno panela
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setNewSurface({ ...newSurface, maxPanels: Math.max(1, newSurface.maxPanels - 1) })
                    }
                    className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newSurface.maxPanels}
                    onChange={(e) =>
                      setNewSurface({ ...newSurface, maxPanels: parseInt(e.target.value) || 1 })
                    }
                    className="w-20 text-center px-3 py-2 rounded-lg border border-slate-300 font-bold text-lg"
                  />
                  <button
                    onClick={() =>
                      setNewSurface({ ...newSurface, maxPanels: Math.min(100, newSurface.maxPanels + 1) })
                    }
                    className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Procena koliko panela može stati na ovu površinu
                </p>
              </div>

              {/* Add button */}
              <div className="flex items-end">
                <Button onClick={handleAddSurface} variant="secondary" className="w-full">
                  + Dodaj površinu
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={nextStep} disabled={!canProceed} size="lg">
          Dalje: Potrošnja struje →
        </Button>
      </div>

      {!canProceed && (
        <p className="text-center text-amber-600 text-sm">
          ⚠️ Dodajte najmanje jednu krovnu površinu za nastavak
        </p>
      )}
    </div>
  );
}
