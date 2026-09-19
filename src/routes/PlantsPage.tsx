import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlantCatalog } from '../hooks/queries';
import { isPlantBloomingInMonth, plantColor } from '../features/garden/sceneHelpers';

type Filter = 'all' | 'blooming' | 'perennial' | 'annual' | 'full_sun' | 'shade';

export default function PlantsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const catalog = usePlantCatalog(search);
  const month = new Date().getMonth() + 1;

  const filtered = useMemo(() => {
    const list = catalog.data ?? [];
    return list.filter((p) => {
      if (filter === 'blooming') return isPlantBloomingInMonth(p, month);
      if (filter === 'perennial') return p.perennial === true;
      if (filter === 'annual') return p.perennial === false;
      if (filter === 'full_sun') return p.sunlight_requirements === 'full_sun';
      if (filter === 'shade') return p.sunlight_requirements === 'shade';
      return true;
    });
  }, [catalog.data, filter, month]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-header__eyebrow">Plant Library</span>
          <h1>Your Plants</h1>
          <p className="page-subtitle">Every species you&rsquo;ve grown or discovered, with what it needs to thrive.</p>
        </div>
        <input
          className="text-input"
          style={{ width: 260 }}
          placeholder="Search common or botanical name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="garden-controls">
        <div className="garden-controls__group" role="group" aria-label="Filter plants">
          {(
            [
              ['all', 'All'],
              ['blooming', 'Blooming now'],
              ['perennial', 'Perennial'],
              ['annual', 'Annual'],
              ['full_sun', 'Full sun'],
              ['shade', 'Shade'],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={'chip' + (filter === id ? ' chip--active' : '')}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {catalog.isLoading && (
        <div className="plant-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          ))}
        </div>
      )}

      {catalog.isError && <div className="error-banner">Could not load the plant catalog.</div>}

      {!catalog.isLoading && filtered.length === 0 && (
        <div className="empty-state">
          <h3>No plants match yet</h3>
          <p>Try a different search or filter, or add a new plant from the garden.</p>
        </div>
      )}

      <div className="plant-grid">
        {filtered.map((p) => {
          const blooming = isPlantBloomingInMonth(p, month);
          return (
            <Link to={`/plants/${p.id}`} key={p.id} className="plant-card">
              <div
                className="plant-card__image"
                style={
                  p.image
                    ? { backgroundImage: `url(${p.image})` }
                    : { background: `linear-gradient(150deg, ${plantColor(p.primary_color)}, var(--color-bg-sunken))` }
                }
              >
                {blooming && <span className="tag tag--gold plant-card__badge">Blooming</span>}
              </div>
              <div className="plant-card__body">
                <div className="plant-card__name">{p.common_name}</div>
                {p.scientific_name && <div className="plant-card__sci">{p.scientific_name}</div>}
                <div className="plant-card__tags">
                  {p.plant_type && <span className="tag">{p.plant_type}</span>}
                  {p.sunlight_requirements && <span className="tag tag--gold">{p.sunlight_requirements.replace('_', ' ')}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
