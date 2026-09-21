import { Link } from 'react-router-dom';
import type { GardenPlant, Zone } from '../../models/types';
import { plantColor, sunlightLabel, waterLabel } from './sceneHelpers';

interface Props {
  zone: Zone;
  plants: GardenPlant[];
  month: number;
  onSelectPlant: (id: number) => void;
  onClose: () => void;
}

export default function ZoneSidePanel({ zone, plants, month, onSelectPlant, onClose }: Props) {
  const bloomCount = plants.filter((p) => {
    const s = p.bloom_start_month;
    const e = p.bloom_end_month;
    if (!s || !e) return false;
    return s <= e ? month >= s && month <= e : month >= s || month <= e;
  }).length;

  return (
    <div className="side-panel">
      <div className="side-panel__header">
        <div>
          <h3 className="side-panel__title">{zone.name}</h3>
          <div className="side-panel__meta">
            <span className="tag">{zone.type.replace('_', ' ')}</span>
            {zone.sunlight && <span className="tag tag--gold">{sunlightLabel(zone.sunlight)}</span>}
            {zone.water_source && (
              <span className={'tag' + (zone.water_source === 'manual' ? ' tag--clay' : ' tag--plum')}>
                {waterLabel(zone.water_source)}
              </span>
            )}
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
          &times;
        </button>
      </div>

      <div className="side-panel__stat-row">
        <div className="side-panel__stat">
          <strong>{plants.length}</strong>
          <span>Plants</span>
        </div>
        <div className="side-panel__stat">
          <strong>{bloomCount}</strong>
          <span>Blooming now</span>
        </div>
      </div>

      {zone.notes && <p className="page-subtitle">{zone.notes}</p>}
      {zone.soil_notes && (
        <p className="page-subtitle">
          <strong>Soil:</strong> {zone.soil_notes}
        </p>
      )}

      <div>
        <p className="section-title">Plants in this zone</p>
        {plants.length === 0 && <p className="page-subtitle">Nothing planted here yet.</p>}
        {plants.map((p) => (
          <button
            key={p.id}
            type="button"
            className="plant-row"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
            onClick={() => onSelectPlant(p.id)}
          >
            <span className="plant-row__dot" style={{ background: plantColor(p.primary_color) }} />
            <span>
              <div className="plant-row__name">{p.nickname || p.common_name || 'Unnamed plant'}</div>
              <div className="plant-row__meta">{p.quantity ?? 1} planted</div>
            </span>
          </button>
        ))}
      </div>

      {plants[0] && (
        <Link to={`/plants/${plants[0].plant_id}`} className="btn btn--sm">
          View plant details
        </Link>
      )}
    </div>
  );
}
