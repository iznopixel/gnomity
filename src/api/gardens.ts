import { api, GARDEN_API } from './client';
import type {
  BloomCalendarEntry,
  DashboardData,
  Garden,
  GardenMapData,
  GardenObject,
  GardenPlant,
  GardenTask,
  Plant,
  SeasonData,
  Zone,
} from '../models/types';

// --- Gardens -----------------------------------------------------------

export function listGardens() {
  return api.get<Garden[]>(`${GARDEN_API}/gardens`);
}

export function getGarden(id: number) {
  return api.get<Garden>(`${GARDEN_API}/gardens/${id}`);
}

export function createGarden(body: Partial<Garden> & { name: string }) {
  return api.post<Garden>(`${GARDEN_API}/gardens`, body);
}

export function seedGarden() {
  return api.post<{ garden?: Garden } | Garden>(`${GARDEN_API}/gardens/seed`);
}

export function updateGarden(id: number, body: Partial<Garden>) {
  return api.patch<Garden>(`${GARDEN_API}/gardens/${id}`, body);
}

export function getGardenMap(id: number) {
  return api.get<GardenMapData>(`${GARDEN_API}/gardens/${id}/map`);
}

export function getGardenDashboard(id: number) {
  return api.get<DashboardData>(`${GARDEN_API}/gardens/${id}/dashboard`);
}

export function getGardenSeason(id: number, month?: number) {
  return api.get<SeasonData>(`${GARDEN_API}/gardens/${id}/season`, { month });
}

export function getBloomCalendar(id: number) {
  return api.get<BloomCalendarEntry[] | { entries: BloomCalendarEntry[] }>(
    `${GARDEN_API}/gardens/${id}/bloom-calendar`
  );
}

// --- Zones ---------------------------------------------------------------

export function listZones(gardenId: number) {
  return api.get<Zone[]>(`${GARDEN_API}/gardens/${gardenId}/zones`);
}

export function createZone(gardenId: number, body: Partial<Zone>) {
  return api.post<Zone>(`${GARDEN_API}/gardens/${gardenId}/zones`, body);
}

export function getZone(id: number) {
  return api.get<Zone>(`${GARDEN_API}/zones/${id}`);
}

export function updateZone(id: number, body: Partial<Zone>) {
  return api.patch<Zone>(`${GARDEN_API}/zones/${id}`, body);
}

export function deleteZone(id: number) {
  return api.delete<{ success: string }>(`${GARDEN_API}/zones/${id}`);
}

// --- Objects (structures: house, patio, path, fence, shed, tree...) ------

export function listObjects(gardenId: number) {
  return api.get<GardenObject[]>(`${GARDEN_API}/gardens/${gardenId}/objects`);
}

export function createObject(gardenId: number, body: Partial<GardenObject>) {
  return api.post<GardenObject>(`${GARDEN_API}/gardens/${gardenId}/objects`, body);
}

export function updateObject(id: number, body: Partial<GardenObject>) {
  return api.patch<GardenObject>(`${GARDEN_API}/objects/${id}`, body);
}

export function deleteObject(id: number) {
  return api.delete<{ success: string }>(`${GARDEN_API}/objects/${id}`);
}

// --- Garden plants (placements) ------------------------------------------

export function listGardenPlants(gardenId: number) {
  return api.get<GardenPlant[]>(`${GARDEN_API}/gardens/${gardenId}/plants`);
}

export function placeGardenPlant(gardenId: number, body: Partial<GardenPlant>) {
  return api.post<GardenPlant>(`${GARDEN_API}/gardens/${gardenId}/plants`, body);
}

export function getGardenPlant(id: number) {
  return api.get<GardenPlant>(`${GARDEN_API}/garden-plants/${id}`);
}

export function updateGardenPlant(id: number, body: Partial<GardenPlant>) {
  return api.patch<GardenPlant>(`${GARDEN_API}/garden-plants/${id}`, body);
}

export function deleteGardenPlant(id: number) {
  return api.delete<{ success: string }>(`${GARDEN_API}/garden-plants/${id}`);
}

// --- Plant catalog ---------------------------------------------------------

export function listPlants(search?: string) {
  return api.get<Plant[]>(`${GARDEN_API}/plants`, { search });
}

export function getPlant(id: number) {
  return api.get<Plant>(`${GARDEN_API}/plants/${id}`);
}

export function createPlant(body: Partial<Plant>) {
  return api.post<Plant>(`${GARDEN_API}/plants`, body);
}

export function updatePlant(id: number, body: Partial<Plant>) {
  return api.patch<Plant>(`${GARDEN_API}/plants/${id}`, body);
}

// --- Tasks ------------------------------------------------------------------

export function listTasks(gardenId: number, filters?: { status?: string; type?: string }) {
  return api.get<GardenTask[]>(`${GARDEN_API}/gardens/${gardenId}/tasks`, filters);
}

export function createTask(gardenId: number, body: Partial<GardenTask>) {
  return api.post<GardenTask>(`${GARDEN_API}/gardens/${gardenId}/tasks`, body);
}

export function updateTask(id: number, body: Partial<GardenTask> & { is_completed?: boolean }) {
  return api.patch<GardenTask>(`${GARDEN_API}/tasks/${id}`, body);
}

export function deleteTask(id: number) {
  return api.delete<{ success: string }>(`${GARDEN_API}/tasks/${id}`);
}
