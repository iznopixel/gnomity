import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as gardensApi from '../api/gardens';
import type { Garden, GardenObject, GardenPlant, GardenTask, Zone } from '../models/types';

// --- Active garden resolution --------------------------------------------
// The demo has one primary garden. We list gardens, and seed if empty.

export function useGardens() {
  return useQuery({ queryKey: ['gardens'], queryFn: gardensApi.listGardens });
}

export function useActiveGarden() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['active-garden'],
    queryFn: async (): Promise<Garden> => {
      const list = await gardensApi.listGardens().catch(() => []);
      if (Array.isArray(list) && list.length > 0) return list[0];

      // The demo seed endpoint is unreliable on this backend deployment; fall
      // back to creating an empty garden the person can build out by hand.
      try {
        const seeded = await gardensApi.seedGarden();
        const garden = (seeded as any)?.garden ?? (seeded as any);
        if (garden?.id) return garden as Garden;
      } catch {
        // fall through to manual creation
      }

      const listAfter = await gardensApi.listGardens().catch(() => []);
      if (Array.isArray(listAfter) && listAfter.length > 0) return listAfter[0];

      return gardensApi.createGarden({ name: 'My Garden' });
    },
    staleTime: Infinity,
  });
  return { ...query, invalidate: () => qc.invalidateQueries({ queryKey: ['active-garden'] }) };
}

// --- Zones -----------------------------------------------------------------

export function useZones(gardenId: number | undefined) {
  return useQuery({
    queryKey: ['zones', gardenId],
    queryFn: () => gardensApi.listZones(gardenId as number),
    enabled: !!gardenId,
  });
}

export function useCreateZone(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Zone>) => gardensApi.createZone(gardenId as number, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones', gardenId] }),
  });
}

export function useUpdateZone(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<Zone> }) => gardensApi.updateZone(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['zones', gardenId] });
      const prev = qc.getQueryData<Zone[]>(['zones', gardenId]);
      if (prev) {
        qc.setQueryData<Zone[]>(
          ['zones', gardenId],
          prev.map((z) => (z.id === id ? { ...z, ...body } : z))
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['zones', gardenId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['zones', gardenId] }),
  });
}

export function useDeleteZone(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gardensApi.deleteZone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones', gardenId] }),
  });
}

// --- Objects (structures) ---------------------------------------------------

export function useObjects(gardenId: number | undefined) {
  return useQuery({
    queryKey: ['objects', gardenId],
    queryFn: () => gardensApi.listObjects(gardenId as number),
    enabled: !!gardenId,
  });
}

export function useCreateObject(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<GardenObject>) => gardensApi.createObject(gardenId as number, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['objects', gardenId] }),
  });
}

export function useUpdateObject(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<GardenObject> }) =>
      gardensApi.updateObject(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['objects', gardenId] });
      const prev = qc.getQueryData<GardenObject[]>(['objects', gardenId]);
      if (prev) {
        qc.setQueryData<GardenObject[]>(
          ['objects', gardenId],
          prev.map((o) => (o.id === id ? { ...o, ...body } : o))
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['objects', gardenId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['objects', gardenId] }),
  });
}

export function useDeleteObject(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gardensApi.deleteObject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['objects', gardenId] }),
  });
}

// --- Garden plants (placements) ---------------------------------------------

export function useGardenPlants(gardenId: number | undefined) {
  return useQuery({
    queryKey: ['garden-plants', gardenId],
    queryFn: () => gardensApi.listGardenPlants(gardenId as number),
    enabled: !!gardenId,
  });
}

export function useGardenPlant(id: number | undefined) {
  return useQuery({
    queryKey: ['garden-plant', id],
    queryFn: () => gardensApi.getGardenPlant(id as number),
    enabled: !!id,
  });
}

export function usePlaceGardenPlant(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<GardenPlant>) => gardensApi.placeGardenPlant(gardenId as number, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garden-plants', gardenId] });
      qc.invalidateQueries({ queryKey: ['dashboard', gardenId] });
      qc.invalidateQueries({ queryKey: ['bloom-calendar', gardenId] });
    },
  });
}

export function useUpdateGardenPlant(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<GardenPlant> }) =>
      gardensApi.updateGardenPlant(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['garden-plants', gardenId] });
      const prev = qc.getQueryData<GardenPlant[]>(['garden-plants', gardenId]);
      if (prev) {
        qc.setQueryData<GardenPlant[]>(
          ['garden-plants', gardenId],
          prev.map((p) => (p.id === id ? { ...p, ...body } : p))
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['garden-plants', gardenId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['garden-plants', gardenId] }),
  });
}

export function useDeleteGardenPlant(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gardensApi.deleteGardenPlant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['garden-plants', gardenId] }),
  });
}

// --- Plant catalog ------------------------------------------------------------

export function usePlantCatalog(search?: string) {
  return useQuery({
    queryKey: ['plant-catalog', search ?? ''],
    queryFn: () => gardensApi.listPlants(search),
  });
}

export function usePlant(id: number | undefined) {
  return useQuery({
    queryKey: ['plant', id],
    queryFn: () => gardensApi.getPlant(id as number),
    enabled: !!id,
  });
}

export function useCreatePlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gardensApi.createPlant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plant-catalog'] }),
  });
}

// --- Tasks -----------------------------------------------------------------

export function useTasks(gardenId: number | undefined, filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['tasks', gardenId, filters],
    queryFn: () => gardensApi.listTasks(gardenId as number, filters),
    enabled: !!gardenId,
  });
}

export function useUpdateTask(gardenId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<GardenTask> & { is_completed?: boolean } }) =>
      gardensApi.updateTask(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', gardenId] });
      qc.invalidateQueries({ queryKey: ['dashboard', gardenId] });
    },
  });
}

// --- Dashboard / Season / Bloom calendar -----------------------------------

export function useDashboard(gardenId: number | undefined) {
  return useQuery({
    queryKey: ['dashboard', gardenId],
    queryFn: () => gardensApi.getGardenDashboard(gardenId as number),
    enabled: !!gardenId,
  });
}

export function useSeason(gardenId: number | undefined, month?: number) {
  return useQuery({
    queryKey: ['season', gardenId, month],
    queryFn: () => gardensApi.getGardenSeason(gardenId as number, month),
    enabled: !!gardenId,
  });
}

export function useBloomCalendar(gardenId: number | undefined) {
  return useQuery({
    queryKey: ['bloom-calendar', gardenId],
    queryFn: () => gardensApi.getBloomCalendar(gardenId as number),
    enabled: !!gardenId,
  });
}
