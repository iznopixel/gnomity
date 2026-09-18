import type { Geometry } from './geometry';

// Domain models mirroring the Xano "Gnome Home" backend (openapi/spec.json).
// Endpoint response bodies in the spec are typed as opaque JSON objects, so
// these interfaces are derived from the documented request-body fields
// (Xano echoes stored fields back on read) plus `id`/timestamps Xano adds
// to every table. Fields the backend may omit are optional.

export type SunlightCondition = 'full_sun' | 'partial_sun' | 'partial_shade' | 'shade';
export type WaterSource = 'sprinkler' | 'drip' | 'manual' | 'rainfall_only' | 'automatic';
export type ZoneType = 'garden_bed' | 'lawn' | 'container_area' | 'patio' | 'path' | 'other';
export type PlantStatus = 'active' | 'dormant' | 'removed' | 'unknown';
export type TaskType =
  | 'water'
  | 'deadhead'
  | 'prune'
  | 'divide'
  | 'fertilize'
  | 'transplant'
  | 'plant'
  | 'custom';
export type StructureType = 'house' | 'patio' | 'path' | 'driveway' | 'fence' | 'shed' | 'tree' | 'other';

export interface Garden {
  id: number;
  name: string;
  location_name?: string | null;
  hardiness_zone?: string | null;
  last_frost_date?: string | null;
  first_frost_date?: string | null;
  created_at?: number;
}

export interface Zone {
  id: number;
  garden_id: number;
  name: string;
  type: ZoneType | string;
  geometry: Geometry | null;
  sunlight?: SunlightCondition | string | null;
  water_source?: WaterSource | string | null;
  soil_notes?: string | null;
  notes?: string | null;
  created_at?: number;
}

export interface GardenObject {
  id: number;
  garden_id: number;
  type: StructureType | string;
  label: string;
  geometry: Geometry | null;
  metadata?: Record<string, unknown> | null;
  sort_order?: number | null;
}

export interface Plant {
  id: number;
  common_name: string;
  scientific_name?: string | null;
  variety?: string | null;
  plant_type?: string | null;
  perennial?: boolean | null;
  bloom_start_month?: number | null;
  bloom_end_month?: number | null;
  sunlight_requirements?: string | null;
  water_requirements?: string | null;
  hardiness_zone_min?: string | null;
  hardiness_zone_max?: string | null;
  mature_height?: string | null;
  mature_spread?: string | null;
  primary_color?: string | null;
  description?: string | null;
  care_notes?: string | null;
  image?: string | null;
}

// A plant placed in a garden. GET /gardens/{id}/plants joins catalog + zone.
export interface GardenPlant {
  id: number;
  garden_id: number;
  plant_id: number;
  zone_id?: number | null;
  nickname?: string | null;
  x: number;
  y: number;
  scale?: number | null;
  quantity?: number | null;
  planted_date?: string | null;
  discovered_date?: string | null;
  status?: PlantStatus | string | null;
  notes?: string | null;
  // Joined fields (best-effort; endpoint says "joined catalog and zone details")
  plant?: Plant | null;
  zone_name?: string | null;
  common_name?: string | null;
  scientific_name?: string | null;
  image?: string | null;
  primary_color?: string | null;
  bloom_start_month?: number | null;
  bloom_end_month?: number | null;
}

export interface GardenTask {
  id: number;
  garden_id: number;
  garden_plant_id?: number | null;
  zone_id?: number | null;
  title: string;
  task_type: TaskType | string;
  due_date?: string | null;
  completed_at?: number | null;
  notes?: string | null;
  // Joined convenience fields some Xano endpoints attach
  zone_name?: string | null;
  plant_name?: string | null;
}

export interface DashboardData {
  blooming_now?: GardenPlant[];
  coming_soon?: GardenPlant[];
  manual_watering?: Zone[];
  stats?: {
    zone_count?: number;
    plant_count?: number;
    open_task_count?: number;
    [key: string]: unknown;
  };
}

export interface SeasonData {
  month: number;
  blooming: GardenPlant[];
  coming_soon: GardenPlant[];
  dormant: GardenPlant[];
}

export interface BloomCalendarEntry {
  plant_id: number;
  garden_plant_id?: number;
  common_name: string;
  scientific_name?: string | null;
  image?: string | null;
  primary_color?: string | null;
  bloom_start_month?: number | null;
  bloom_end_month?: number | null;
  zone_id?: number | null;
  zone_name?: string | null;
  plant_type?: string | null;
}

export interface GardenMapData {
  garden: Garden;
  zones: Zone[];
  objects: GardenObject[];
  plants: GardenPlant[];
}
