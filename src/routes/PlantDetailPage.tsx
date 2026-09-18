import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePlant } from '../hooks/queries';
import { useGardenScene } from '../features/garden/useGardenScene';
import { useGardenNavigation } from '../features/garden/useGardenNavigation';
import GardenCanvas from '../components/GardenCanvas';
import { MONTH_LABELS } from '../state/editorStore';
import { plantColor } from '../features/garden/sceneHelpers';

export default function PlantDetailPage() {
  const { id } = useParams();
  const plantId = Number(id);
  const navigate = useNavigate();
  const goToGarden = useGardenNavigation();

  const plantQuery = usePlant(plantId);
  const { zones, objects, plants } = useGardenScene();

  const plant = plantQuery.data;
  const placements = plants.filter((p) => p.plant_id === plantId);
  const zone = placements[0] ? zones.find((z) => z.id === placements[0].zone_id) : undefined;

  if (plantQuery.isLoading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
      </div>
    );
  }

  if (plantQuery.isError || !plant) {
    return (
      <div className="page">
        <div className="error-banner">This plant could not be found.</div>
        <button className="btn" onClick={() => navigate('/plants')} style={{ marginTop: 16 }}>
          Back to library
        </button>
      </div>
    );
  }

  const bloomActive = (m: number) => {
    const s = plant.bloom_start_month;
    const e = plant.bloom_end_month;
    if (!s || !e) return false;
    return s <= e ? m >= s && m <= e : m >= s || m <= e;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-header__eyebrow">
            <Link to="/plants">Plant Library</Link>
          </span>
          <h1>{plant.common_name}</h1>
          {plant.scientific_name && <p className="page-subtitle" style={{ fontStyle: 'italic' }}>{plant.scientific_name}{plant.variety ? ` · ${plant.variety}` : ''}</p>}
        </div>
        {placements[0] && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => goToGarden({ plantId: placements[0].id, view: 'plants' })}
          >
            Show in Garden
          </button>
        )}
      </div>

      <div className="plant-detail">
        <div>
          <div
            className="plant-detail__hero"
            style={
              plant.image
                ? { backgroundImage: `url(${plant.image})` }
                : { background: `linear-gradient(150deg, ${plantColor(plant.primary_color)}, var(--color-bg-sunken))` }
            }
          />
          {placements[0]?.zone_id && zones.find((z) => z.id === placements[0].zone_id) && (
            <div className="mini-map" style={{ marginTop: 16 }}>
              <GardenCanvas
                zones={zones}
                objects={objects}
                plants={placements}
                viewMode="plants"
                month={new Date().getMonth() + 1}
                mode="explore"
                selected={{ kind: 'plant', id: placements[0].id }}
                onSelect={() => {}}
              />
            </div>
          )}
        </div>

        <div>
          <div className="plant-detail__section">
            <p className="section-title">My Garden</p>
            <div className="detail-grid">
              <div className="detail-grid__item">
                <strong>{zone?.name ?? '—'}</strong>
                <span>Zone</span>
              </div>
              <div className="detail-grid__item">
                <strong>{placements.reduce((n, p) => n + (p.quantity ?? 1), 0) || '—'}</strong>
                <span>Quantity</span>
              </div>
              <div className="detail-grid__item">
                <strong>{placements[0]?.planted_date ?? placements[0]?.discovered_date ?? '—'}</strong>
                <span>{placements[0]?.planted_date ? 'Planted' : 'Discovered'}</span>
              </div>
              <div className="detail-grid__item">
                <strong style={{ textTransform: 'capitalize' }}>{placements[0]?.status ?? 'Not planted'}</strong>
                <span>Status</span>
              </div>
            </div>
            {placements[0]?.notes && <p className="page-subtitle" style={{ marginTop: 12 }}>{placements[0].notes}</p>}
          </div>

          <div className="plant-detail__section">
            <p className="section-title">Growing Conditions</p>
            <div className="detail-grid">
              <div className="detail-grid__item">
                <strong style={{ textTransform: 'capitalize' }}>{plant.sunlight_requirements?.replace('_', ' ') ?? '—'}</strong>
                <span>Sunlight</span>
              </div>
              <div className="detail-grid__item">
                <strong style={{ textTransform: 'capitalize' }}>{plant.water_requirements ?? '—'}</strong>
                <span>Water</span>
              </div>
              <div className="detail-grid__item">
                <strong>{plant.hardiness_zone_min && plant.hardiness_zone_max ? `${plant.hardiness_zone_min}–${plant.hardiness_zone_max}` : '—'}</strong>
                <span>Hardiness</span>
              </div>
              <div className="detail-grid__item">
                <strong>{plant.mature_height ?? '—'}</strong>
                <span>Mature height</span>
              </div>
              <div className="detail-grid__item">
                <strong>{plant.mature_spread ?? '—'}</strong>
                <span>Mature spread</span>
              </div>
              <div className="detail-grid__item">
                <strong>{plant.perennial == null ? '—' : plant.perennial ? 'Perennial' : 'Annual'}</strong>
                <span>Life cycle</span>
              </div>
            </div>
          </div>

          <div className="plant-detail__section">
            <p className="section-title">Seasonal Information</p>
            <div className="bloom-bar">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className={'bloom-bar__month' + (bloomActive(i + 1) ? ' bloom-bar__month--active' : '')} />
              ))}
            </div>
            <div className="bloom-bar__labels">
              {MONTH_LABELS.map((l) => (
                <span key={l}>{l[0]}</span>
              ))}
            </div>
          </div>

          {(plant.description || plant.care_notes) && (
            <div className="plant-detail__section">
              <p className="section-title">About</p>
              {plant.description && <p className="page-subtitle">{plant.description}</p>}
              {plant.care_notes && (
                <p className="page-subtitle">
                  <strong>Care:</strong> {plant.care_notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
