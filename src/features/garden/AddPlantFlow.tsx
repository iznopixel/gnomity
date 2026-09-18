import { useState } from 'react';
import type { Plant, Zone } from '../../models/types';
import { usePlantCatalog } from '../../hooks/queries';
import { plantColor } from './sceneHelpers';

export type AddPlantStep = 'pick-plant' | 'pick-zone' | 'place' | 'details';

interface Props {
  step: AddPlantStep;
  zones: Zone[];
  selectedPlant: Plant | null;
  selectedZoneId: number | null;
  placedAt: { x: number; y: number } | null;
  onPickPlant: (plant: Plant) => void;
  onPickZone: (zoneId: number | null) => void;
  onSave: (details: { nickname: string; quantity: number; notes: string }) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function AddPlantFlow({
  step,
  zones,
  selectedPlant,
  selectedZoneId,
  placedAt,
  onPickPlant,
  onPickZone,
  onSave,
  onCancel,
  saving,
}: Props) {
  const [search, setSearch] = useState('');
  const catalog = usePlantCatalog(search);
  const [nickname, setNickname] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  return (
    <div className="add-plant-flow panel">
      <div className="add-plant-flow__steps" aria-hidden="true">
        {(['pick-plant', 'pick-zone', 'place', 'details'] as AddPlantStep[]).map((s, i) => (
          <span key={s} className={'add-plant-flow__step' + (step === s ? ' add-plant-flow__step--active' : '')}>
            {i + 1}
          </span>
        ))}
      </div>

      {step === 'pick-plant' && (
        <div className="add-plant-flow__panel">
          <p className="section-title">1. Choose a plant</p>
          <input
            className="text-input"
            placeholder="Search plant catalog…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="add-plant-flow__list">
            {catalog.isLoading && <div className="skeleton" style={{ height: 40 }} />}
            {catalog.data?.map((p) => (
              <button key={p.id} type="button" className="add-plant-flow__option" onClick={() => onPickPlant(p)}>
                <span className="plant-row__dot" style={{ background: plantColor(p.primary_color) }} />
                <span>
                  <div className="plant-row__name">{p.common_name}</div>
                  {p.scientific_name && <div className="plant-row__meta">{p.scientific_name}</div>}
                </span>
              </button>
            ))}
            {catalog.data?.length === 0 && <p className="page-subtitle">No matches. Try a different search.</p>}
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {step === 'pick-zone' && (
        <div className="add-plant-flow__panel">
          <p className="section-title">2. Choose a garden zone</p>
          <p className="page-subtitle">Placing {selectedPlant?.common_name}. Pick the bed it belongs in, or skip.</p>
          <div className="add-plant-flow__list">
            {zones.map((z) => (
              <button
                key={z.id}
                type="button"
                className={'add-plant-flow__option' + (selectedZoneId === z.id ? ' add-plant-flow__option--active' : '')}
                onClick={() => onPickZone(z.id)}
              >
                <span className="plant-row__name">{z.name}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onPickZone(null)}>
              Skip zone
            </button>
          </div>
        </div>
      )}

      {step === 'place' && (
        <div className="add-plant-flow__panel">
          <p className="section-title">3. Click on the garden to place it</p>
          <p className="page-subtitle">
            Click anywhere on the map to set where {selectedPlant?.common_name} lives.
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {step === 'details' && placedAt && (
        <form
          className="add-plant-flow__panel"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ nickname, quantity, notes });
          }}
        >
          <p className="section-title">4. Optional details</p>
          <label className="field">
            <span>Nickname</span>
            <input className="text-input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={selectedPlant?.common_name} />
          </label>
          <label className="field">
            <span>Quantity</span>
            <input
              className="text-input"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea className="text-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save plant'}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
