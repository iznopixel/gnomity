import { useState } from 'react';
import type { Geometry } from '../../models/geometry';

interface Props {
  geometry: Geometry;
  onSave: (data: { name: string; type: string; sunlight: string; water_source: string }) => void;
  onCancel: () => void;
  saving?: boolean;
}

const ZONE_TYPES = ['garden_bed', 'lawn', 'container_area', 'patio', 'path', 'other'];
const SUNLIGHT = ['full_sun', 'partial_sun', 'partial_shade', 'shade'];
const WATER = ['automatic', 'sprinkler', 'drip', 'manual', 'rainfall_only'];

export default function AddAreaForm({ onSave, onCancel, saving }: Props) {
  const [name, setName] = useState('New Bed');
  const [type, setType] = useState('garden_bed');
  const [sunlight, setSunlight] = useState('full_sun');
  const [water, setWater] = useState('manual');

  return (
    <form
      className="add-plant-flow panel"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, type, sunlight, water_source: water });
      }}
    >
      <p className="section-title">Name this area</p>
      <label className="field">
        <span>Name</span>
        <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      <label className="field">
        <span>Type</span>
        <select className="text-input" value={type} onChange={(e) => setType(e.target.value)}>
          {ZONE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sunlight</span>
        <select className="text-input" value={sunlight} onChange={(e) => setSunlight(e.target.value)}>
          {SUNLIGHT.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Watering</span>
        <select className="text-input" value={water} onChange={(e) => setWater(e.target.value)}>
          {WATER.map((w) => (
            <option key={w} value={w}>
              {w.replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? 'Saving…' : 'Create area'}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
          Discard
        </button>
      </div>
    </form>
  );
}
