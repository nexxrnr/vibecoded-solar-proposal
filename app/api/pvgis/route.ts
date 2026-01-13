// PVGIS API Proxy
// Proxies requests to EU JRC PVGIS API (which doesn't allow CORS)

import { NextRequest, NextResponse } from "next/server";
import { PVGIS_LOSS_PERCENT } from "@/lib/constants";

const PVGIS_BASE_URL = "https://re.jrc.ec.europa.eu/api/PVcalc";

interface PVGISMonthlyData {
  month: number;
  E_m: number; // Monthly energy production in kWh
}

interface PVGISResponse {
  outputs: {
    monthly: {
      fixed: PVGISMonthlyData[];
    };
    totals: {
      fixed: {
        E_y: number; // Annual energy production in kWh
      };
    };
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const peakpower = searchParams.get("peakpower") || "1"; // Default to 1 kWp for base calculation
  const angle = searchParams.get("angle") || "35";
  const aspect = searchParams.get("aspect") || "0";

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing required parameters: lat and lon" },
      { status: 400 }
    );
  }

  try {
    const url = `${PVGIS_BASE_URL}?lat=${lat}&lon=${lon}&peakpower=${peakpower}&angle=${angle}&aspect=${aspect}&loss=${PVGIS_LOSS_PERCENT}&outputformat=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`PVGIS API returned ${response.status}`);
    }

    const data: PVGISResponse = await response.json();

    // Extract and format monthly production
    const monthlyProduction: { [key: number]: number } = {};
    for (const item of data.outputs.monthly.fixed) {
      monthlyProduction[item.month] = Math.round(item.E_m);
    }

    // Calculate annual production
    const annualProduction = Object.values(monthlyProduction).reduce(
      (sum, val) => sum + val,
      0
    );

    return NextResponse.json({
      success: true,
      monthlyProduction,
      annualProduction,
      // Production per kWp (useful for scaling)
      productionPerKwp: annualProduction / parseFloat(peakpower),
    });
  } catch (error) {
    console.error("PVGIS API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch solar production data" },
      { status: 500 }
    );
  }
}

// Also support POST for multiple surfaces at once
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lon, surfaces } = body;

    if (!lat || !lon || !surfaces || !Array.isArray(surfaces)) {
      return NextResponse.json(
        { error: "Missing required parameters: lat, lon, and surfaces array" },
        { status: 400 }
      );
    }

    // First, get base production per kWp (1 kWp at average angle/aspect)
    const baseUrl = `${PVGIS_BASE_URL}?lat=${lat}&lon=${lon}&peakpower=1&angle=35&aspect=0&loss=${PVGIS_LOSS_PERCENT}&outputformat=json`;
    const baseResponse = await fetch(baseUrl);

    if (!baseResponse.ok) {
      throw new Error(`PVGIS API returned ${baseResponse.status}`);
    }

    const baseData: PVGISResponse = await baseResponse.json();

    // Extract base monthly production per kWp
    const baseMonthlyPerKwp: { [key: number]: number } = {};
    for (const item of baseData.outputs.monthly.fixed) {
      baseMonthlyPerKwp[item.month] = Math.round(item.E_m);
    }

    const baseAnnualPerKwp = Object.values(baseMonthlyPerKwp).reduce(
      (sum, val) => sum + val,
      0
    );

    // Now fetch production for each surface
    const surfaceResults = [];
    const combinedMonthly: { [key: number]: number } = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
      7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
    };

    for (const surface of surfaces) {
      const { angle, aspect, peakpower, shading } = surface;

      const surfaceUrl = `${PVGIS_BASE_URL}?lat=${lat}&lon=${lon}&peakpower=${peakpower}&angle=${angle}&aspect=${aspect}&loss=${PVGIS_LOSS_PERCENT}&outputformat=json`;

      const surfaceResponse = await fetch(surfaceUrl);

      if (!surfaceResponse.ok) {
        throw new Error(`PVGIS API returned ${surfaceResponse.status} for surface`);
      }

      const surfaceData: PVGISResponse = await surfaceResponse.json();

      const surfaceMonthly: { [key: number]: number } = {};
      for (const item of surfaceData.outputs.monthly.fixed) {
        // Apply shading factor
        const adjustedProduction = Math.round(item.E_m * (1 - (shading || 0)));
        surfaceMonthly[item.month] = adjustedProduction;
        combinedMonthly[item.month] += adjustedProduction;
      }

      surfaceResults.push({
        angle,
        aspect,
        peakpower,
        shading,
        monthlyProduction: surfaceMonthly,
        annualProduction: Object.values(surfaceMonthly).reduce((sum, val) => sum + val, 0),
      });
    }

    const totalAnnual = Object.values(combinedMonthly).reduce((sum, val) => sum + val, 0);

    return NextResponse.json({
      success: true,
      // Base production per kWp (for scaling calculations)
      baseMonthlyPerKwp,
      baseAnnualPerKwp,
      // Combined production from all surfaces
      combinedMonthlyProduction: combinedMonthly,
      totalAnnualProduction: totalAnnual,
      // Individual surface breakdowns
      surfaces: surfaceResults,
    });
  } catch (error) {
    console.error("PVGIS API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch solar production data" },
      { status: 500 }
    );
  }
}
