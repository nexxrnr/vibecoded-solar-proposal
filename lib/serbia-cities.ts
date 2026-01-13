// Serbian cities with coordinates for the location selector

export interface SerbianCity {
  name: string;
  lat: number;
  lon: number;
}

export const SERBIAN_CITIES: SerbianCity[] = [
  { name: "Beograd", lat: 44.8176, lon: 20.4569 },
  { name: "Novi Sad", lat: 45.2671, lon: 19.8335 },
  { name: "Niš", lat: 43.3209, lon: 21.8958 },
  { name: "Kragujevac", lat: 44.0128, lon: 20.9114 },
  { name: "Subotica", lat: 46.1000, lon: 19.6667 },
  { name: "Zrenjanin", lat: 45.3833, lon: 20.3833 },
  { name: "Pančevo", lat: 44.8708, lon: 20.6403 },
  { name: "Čačak", lat: 43.8914, lon: 20.3497 },
  { name: "Novi Pazar", lat: 43.1367, lon: 20.5122 },
  { name: "Kraljevo", lat: 43.7233, lon: 20.6897 },
];

// Slope presets for roof angle
export const SLOPE_OPTIONS = [
  { value: 0, label: "Ravan (0°)" },
  { value: 10, label: "Blag (10°)" },
  { value: 25, label: "Običan nagib (25°)" },
  { value: 35, label: "Strm (35°)" },
];

export const DEFAULT_SLOPE = 25;
export const DEFAULT_SHADING = 10; // 10% shading is typical
export const DEFAULT_MAX_PANELS = 20;
