import { Link } from 'react-router-dom';
import type { GardenPlant, Zone } from '../../models/types';
import { isPlantBloomingInMonth, plantColor, sunlightLabel, waterLabel } from './sceneHelpers';

interface Props {
  plant: GardenPlant;
  zone?: Zone | null;
  month: number;
  onClose: () => void;
}

export default function PlantSidePanel({ plant, zone, month, onClose }: Props) {
  const blooming = isPlantBloomingInMonth(plant, month);
  return (
    <div className="side-panel">
      <div className="side-panel__header">
        <div>
          <h3 className="side-panel__title">{plant.nickname || plant.common_name}</h3>
          {plant.scientific_name && (
            <p className="page-subtitle" style={{ fontStyle: 'italic', margin: 0 }}>
              {plant.scientific_name}
            </p>
          )}
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
          &times;
        </button>
      </div>

      <div
        className="plant-detail__swatch"
        style={{ background: `linear-gradient(135deg, ${plantColor(plant.primary_color)}, var(--color-bg-sunken))` }}
      />

      <div className="side-panel__meta">
        {blooming && <span className="tag tag--gold">Blooming now</span>}
        {zone && <span className="tag">{zone.name}</span>}
        {zone?.sunlight && <span className="tag tag--gold">{sunlightLabel(zone.sunlight)}</span>}
        {zone?.water_source && <span className="tag tag--plum">{waterLabel(zone.water_source)}</span>}
      </div>

      <div className="side-panel__stat-row">
        <div className="side-panel__stat">
          <strong>{plant.quantity ?? 1}</strong>
          <span>Quantity</span>
        </div>
        {plant.status && (
          <div className="side-panel__stat">
            <strong style={{ textTransform: 'capitalize' }}>{plant.status}</strong>
            <span>Status</span>
          </div>
        )}
      </div>

      {plant.notes && <p className="page-subtitle">{plant.notes}</p>}

      <Link to={`/plants/${plant.plant_id}`} className="btn btn--primary btn--sm">
        View full plant details
      </Link>
    </div>
  );
}
