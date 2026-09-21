import type { GardenPlant, GardenTask, Plant, Zone } from '../../models/types';

export const SUNLIGHT_LABELS: Record<string, string> = {
  full_sun: 'Full Sun',
  partial_sun: 'Partial Sun',
  partial_shade: 'Partial Shade',
  shade: 'Shade',
};

export const SUNLIGHT_COLORS: Record<string, string> = {
  full_sun: '#c99a3e',
  partial_sun: '#d8b56c',
  partial_shade: '#8fa0ac',
  shade: '#5c6b74',
};

export const WATER_LABELS: Record<string, string> = {
  automatic: 'Automatic',
  sprinkler: 'Sprinkler',
  drip: 'Drip',
  manual: 'Manual',
  rainfall_only: 'Rainfall Only',
};

export const WATER_COLORS: Record<string, string> = {
  automatic: '#6f92a3',
  sprinkler: '#6f92a3',
  drip: '#5c8a72',
  manual: '#b56a4a',
  rainfall_only: '#9ab6a0',
};

export const ZONE_TYPE_FILL: Record<string, string> = {
  garden_bed: '#c7d8c8',
  lawn: '#d7e2c9',
  container_area: '#e3dac4',
  patio: '#ddd2bd',
  path: '#e6ddca',
  other: '#e0dccf',
};

export function sunlightLabel(s?: string | null): string {
  if (!s) return 'Unknown';
  return SUNLIGHT_LABELS[s] ?? s;
}

export function waterLabel(w?: string | null): string {
  if (!w) return 'Unknown';
  return WATER_LABELS[w] ?? w;
}

export function isPlantBloomingInMonth(plant: { bloom_start_month?: number | null; bloom_end_month?: number | null } | null | undefined, month: number): boolean {
  if (!plant) return false;
  const start = plant.bloom_start_month;
  const end = plant.bloom_end_month;
  if (!start || !end) return false;
  if (start <= end) return month >= start && month <= end;
  // wraps around the year (e.g. Nov -> Feb)
  return month >= start || month <= end;
}

export function isPlantComingSoon(plant: { bloom_start_month?: number | null } | null | undefined, month: number): boolean {
  if (!plant?.bloom_start_month) return false;
  const diff = (plant.bloom_start_month - month + 12) % 12;
  return diff > 0 && diff <= 2;
}

export function monthsUntilBloom(plant: { bloom_start_month?: number | null } | null | undefined, month: number): number {
  if (!plant?.bloom_start_month) return Infinity;
  return (plant.bloom_start_month - month + 12) % 12;
}

const PALETTE_BY_COLOR: Record<string, string> = {
  pink: '#c97f92',
  red: '#a5432f',
  orange: '#c97b3e',
  yellow: '#c99a3e',
  gold: '#c99a3e',
  purple: '#7a5a78',
  violet: '#7a5a78',
  blue: '#6f92a3',
  white: '#e8e2d3',
  cream: '#e8e2d3',
  green: '#587c62',
  burgundy: '#7a3446',
  magenta: '#a3567f',
  lavender: '#9c8fb0',
  peach: '#dba079',
};

export function plantColor(primaryColor?: string | null): string {
  if (!primaryColor) return '#7f9c85';
  const key = primaryColor.toLowerCase().trim();
  for (const [name, hex] of Object.entries(PALETTE_BY_COLOR)) {
    if (key.includes(name)) return hex;
  }
  return '#7f9c85';
}

export function zoneWatersManually(zone: Zone): boolean {
  return zone.water_source === 'manual';
}

export function taskIsOpen(task: GardenTask): boolean {
  return task.completed_at == null;
}

export function mergePlantCatalog(gardenPlants: GardenPlant[], catalog: Plant[]): GardenPlant[] {
  if (!catalog.length) return gardenPlants;
  const byId = new Map(catalog.map((p) => [p.id, p]));
  return gardenPlants.map((gp) => {
    const catalogPlant = byId.get(gp.plant_id);
    if (!catalogPlant) return gp;
    return {
      ...gp,
      plant: catalogPlant,
      common_name: gp.common_name ?? catalogPlant.common_name,
      scientific_name: gp.scientific_name ?? catalogPlant.scientific_name,
      image: gp.image ?? catalogPlant.image,
      primary_color: gp.primary_color ?? catalogPlant.primary_color,
      bloom_start_month: gp.bloom_start_month ?? catalogPlant.bloom_start_month,
      bloom_end_month: gp.bloom_end_month ?? catalogPlant.bloom_end_month,
    };
  });
}
