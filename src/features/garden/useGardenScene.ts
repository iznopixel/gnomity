import { useMemo } from 'react';
import { useActiveGarden, useGardenPlants, useObjects, usePlantCatalog, useZones } from '../../hooks/queries';
import { mergePlantCatalog } from './sceneHelpers';

// Composes server-state (Garden/Zones/Objects/GardenPlants/Plant catalog) into
// a single "garden scene" the renderer can consume, without coupling
// <GardenCanvas> directly to raw API shapes.
export function useGardenScene() {
  const gardenQuery = useActiveGarden();
  const gardenId = gardenQuery.data?.id;

  const zonesQuery = useZones(gardenId);
  const objectsQuery = useObjects(gardenId);
  const gardenPlantsQuery = useGardenPlants(gardenId);
  const catalogQuery = usePlantCatalog();

  const plants = useMemo(() => {
    const gardenPlants = gardenPlantsQuery.data ?? [];
    const catalog = catalogQuery.data ?? [];
    return mergePlantCatalog(gardenPlants, catalog);
  }, [gardenPlantsQuery.data, catalogQuery.data]);

  const isLoading = gardenQuery.isLoading || zonesQuery.isLoading || objectsQuery.isLoading;

  // Garden/zones/objects are load-bearing for the page shell; garden-plants
  // and the catalog degrade gracefully (some backend endpoints that join
  // plant data are currently unreliable — see README/report), so their
  // failures don't block rendering the rest of the garden.
  const isError = gardenQuery.isError || zonesQuery.isError || objectsQuery.isError;
  const plantsUnavailable = gardenPlantsQuery.isError;

  return {
    garden: gardenQuery.data,
    gardenId,
    zones: zonesQuery.data ?? [],
    objects: objectsQuery.data ?? [],
    plants,
    catalog: catalogQuery.data ?? [],
    isLoading,
    isError,
    plantsUnavailable,
  };
}
