import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GardenCanvas, { type DrawShape } from '../components/GardenCanvas';
import GardenViewControls from '../components/GardenViewControls';
import MonthScrubber from '../components/MonthScrubber';
import { useGardenScene } from '../features/garden/useGardenScene';
import ZoneSidePanel from '../features/garden/ZoneSidePanel';
import PlantSidePanel from '../features/garden/PlantSidePanel';
import AddPlantFlow, { type AddPlantStep } from '../features/garden/AddPlantFlow';
import AddAreaForm from '../features/garden/AddAreaForm';
import { useEditorStore } from '../state/editorStore';
import type { Geometry } from '../models/geometry';
import type { Plant } from '../models/types';
import {
  useCreateZone,
  usePlaceGardenPlant,
  useUpdateGardenPlant,
  useUpdateZone,
} from '../hooks/queries';

export default function GardenPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    editorMode,
    activeView,
    selectedMonth,
    selected,
    hovered,
    setEditorMode,
    setActiveView,
    setSelectedMonth,
    select,
    setHovered,
  } = useEditorStore();

  const { garden, gardenId, zones, objects, plants, isLoading, isError, plantsUnavailable } = useGardenScene();

  const createZone = useCreateZone(gardenId);
  const updateZone = useUpdateZone(gardenId);
  const updateGardenPlant = useUpdateGardenPlant(gardenId);
  const placeGardenPlant = usePlaceGardenPlant(gardenId);

  const [drawShape, setDrawShape] = useState<DrawShape>('rect');
  const [pendingGeometry, setPendingGeometry] = useState<Geometry | null>(null);

  // Add-plant flow state
  const [addStep, setAddStep] = useState<AddPlantStep | null>(null);
  const [addPlantChoice, setAddPlantChoice] = useState<Plant | null>(null);
  const [addZoneId, setAddZoneId] = useState<number | null>(null);
  const [addPlacedAt, setAddPlacedAt] = useState<{ x: number; y: number } | null>(null);
  const [justAdded, setJustAdded] = useState<number | null>(null);

  // Apply cross-feature navigation params once data is loaded.
  useEffect(() => {
    if (!zones.length && !plants.length) return;
    const plantParam = searchParams.get('plant');
    const zoneParam = searchParams.get('zone');
    const viewParam = searchParams.get('view');
    const monthParam = searchParams.get('month');
    if (viewParam) setActiveView(viewParam as any);
    if (monthParam) setSelectedMonth(Number(monthParam));
    if (plantParam) select({ kind: 'plant', id: Number(plantParam) });
    else if (zoneParam) select({ kind: 'zone', id: Number(zoneParam) });
    if (plantParam || zoneParam || viewParam || monthParam) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones.length, plants.length]);

  const selectedZone = selected?.kind === 'zone' ? zones.find((z) => z.id === selected.id) : undefined;
  const selectedPlant = selected?.kind === 'plant' ? plants.find((p) => p.id === selected.id) : undefined;

  const handleModeChange = (m: typeof editorMode) => {
    setEditorMode(m);
    if (m !== 'add-plant') {
      setAddStep(null);
      setAddPlantChoice(null);
      setAddZoneId(null);
      setAddPlacedAt(null);
    }
    if (m === 'add-plant') setAddStep('pick-plant');
  };

  const startAddPlant = () => {
    setEditorMode('add-plant');
    setAddStep('pick-plant');
  };

  const cancelAddPlant = () => {
    setEditorMode('explore');
    setAddStep(null);
    setAddPlantChoice(null);
    setAddZoneId(null);
    setAddPlacedAt(null);
  };

  const handleCreateZoneGeometry = (geometry: Geometry) => {
    setPendingGeometry(geometry);
  };

  const handleSaveArea = (data: { name: string; type: string; sunlight: string; water_source: string }) => {
    if (!pendingGeometry) return;
    createZone.mutate(
      { name: data.name, type: data.type, geometry: pendingGeometry, sunlight: data.sunlight, water_source: data.water_source },
      { onSuccess: () => setPendingGeometry(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 480, borderRadius: 20 }} />
      </div>
    );
  }

  if (isError || !garden) {
    return (
      <div className="page">
        <div className="error-banner">Could not load your garden. Please check your connection and try again.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-header__eyebrow">The Garden Model</span>
          <h1>{garden.name}</h1>
          <p className="page-subtitle">
            {garden.location_name ? `${garden.location_name} · ` : ''}
            {garden.hardiness_zone ? `Zone ${garden.hardiness_zone}` : 'An overhead model of your outdoor space'}
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={startAddPlant}>
          + Add Plant
        </button>
      </div>

      {plantsUnavailable && (
        <div className="error-banner" style={{ marginBottom: 'var(--space-4)' }}>
          Plant placements couldn&rsquo;t be loaded for this garden right now, so the map is showing layout only.
        </div>
      )}

      <div className="garden-toolbar">
        <GardenViewControls
          activeView={activeView}
          onViewChange={setActiveView}
          editorMode={editorMode}
          onModeChange={handleModeChange}
        />
        <div style={{ width: 420, maxWidth: '100%' }}>
          <MonthScrubber month={selectedMonth} onChange={setSelectedMonth} />
        </div>
      </div>

      {editorMode === 'add-area' && (
        <div className="garden-controls" style={{ marginTop: -8 }}>
          <div className="garden-controls__group">
            <button
              type="button"
              className={'chip chip--outline' + (drawShape === 'rect' ? ' chip--active' : '')}
              onClick={() => setDrawShape('rect')}
            >
              Rectangle bed
            </button>
            <button
              type="button"
              className={'chip chip--outline' + (drawShape === 'polygon' ? ' chip--active' : '')}
              onClick={() => setDrawShape('polygon')}
            >
              Freeform bed (click points, double-click to finish)
            </button>
          </div>
        </div>
      )}

      <div className="garden-layout">
        <GardenCanvas
          zones={zones}
          objects={objects}
          plants={plants}
          viewMode={activeView}
          month={selectedMonth}
          mode={editorMode}
          drawShape={drawShape}
          selected={selected}
          onSelect={select}
          hovered={hovered}
          onHover={setHovered}
          highlightPlantId={justAdded}
          onZoneGeometryChange={(id, geometry) => updateZone.mutate({ id, body: { geometry } })}
          onPlantMove={(id, x, y) => updateGardenPlant.mutate({ id, body: { x, y } })}
          onCreateZoneGeometry={handleCreateZoneGeometry}
          onCanvasClickForPlacement={(x, y) => {
            if (addStep === 'place') {
              setAddPlacedAt({ x, y });
              setAddStep('details');
            }
          }}
        />

        <aside className="panel garden-layout__sidebar">
          {selectedZone && (
            <ZoneSidePanel
              zone={selectedZone}
              plants={plants.filter((p) => p.zone_id === selectedZone.id)}
              month={selectedMonth}
              onSelectPlant={(id) => select({ kind: 'plant', id })}
              onClose={() => select(null)}
            />
          )}
          {selectedPlant && (
            <PlantSidePanel
              plant={selectedPlant}
              zone={zones.find((z) => z.id === selectedPlant.zone_id)}
              month={selectedMonth}
              onClose={() => select(null)}
            />
          )}
          {!selectedZone && !selectedPlant && (
            <div className="empty-state">
              <h3>Explore your garden</h3>
              <p>Click a bed or a plant on the map to see what&rsquo;s growing there.</p>
            </div>
          )}
        </aside>
      </div>

      {pendingGeometry && (
        <AddAreaForm
          geometry={pendingGeometry}
          onSave={handleSaveArea}
          onCancel={() => setPendingGeometry(null)}
          saving={createZone.isPending}
        />
      )}

      {editorMode === 'add-plant' && addStep && (
        <AddPlantFlow
          step={addStep}
          zones={zones}
          selectedPlant={addPlantChoice}
          selectedZoneId={addZoneId}
          placedAt={addPlacedAt}
          onPickPlant={(p) => {
            setAddPlantChoice(p);
            setAddStep('pick-zone');
          }}
          onPickZone={(zoneId) => {
            setAddZoneId(zoneId);
            setAddStep('place');
          }}
          onSave={(details) => {
            if (!addPlantChoice || !addPlacedAt) return;
            placeGardenPlant.mutate(
              {
                plant_id: addPlantChoice.id,
                zone_id: addZoneId ?? undefined,
                x: addPlacedAt.x,
                y: addPlacedAt.y,
                nickname: details.nickname || undefined,
                quantity: details.quantity,
                notes: details.notes || undefined,
              },
              {
                onSuccess: (created) => {
                  cancelAddPlant();
                  if (created && (created as any).id) setJustAdded((created as any).id);
                  setTimeout(() => setJustAdded(null), 2600);
                },
              }
            );
          }}
          onCancel={cancelAddPlant}
          saving={placeGardenPlant.isPending}
        />
      )}

      {placeGardenPlant.isError && (
        <div className="add-plant-flow__error error-banner">
          Couldn&rsquo;t save this plant placement — the garden service rejected the request. Your layout changes
          are unaffected.
        </div>
      )}
    </div>
  );
}
