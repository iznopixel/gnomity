import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGardenScene } from '../features/garden/useGardenScene';
import { MONTH_LABELS } from '../state/editorStore';
import { plantColor } from '../features/garden/sceneHelpers';

export default function CalendarPage() {
  const { zones, plants, catalog, isLoading } = useGardenScene();
  const currentMonth = new Date().getMonth() + 1;

  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const plantTypes = useMemo(
    () => Array.from(new Set(catalog.map((p) => p.plant_type).filter(Boolean))) as string[],
    [catalog]
  );

  // One row per distinct planted species that has bloom data.
  const rows = useMemo(() => {
    const byPlant = new Map<number, (typeof plants)[number]>();
    for (const p of plants) {
      if (!p.bloom_start_month || !p.bloom_end_month) continue;
      if (!byPlant.has(p.plant_id)) byPlant.set(p.plant_id, p);
    }
    return Array.from(byPlant.values()).filter((p) => {
      if (zoneFilter !== 'all' && String(p.zone_id) !== zoneFilter) return false;
      if (typeFilter !== 'all' && p.plant?.plant_type !== typeFilter) return false;
      return true;
    });
  }, [plants, zoneFilter, typeFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-header__eyebrow">Signature View</span>
          <h1>Bloom Calendar</h1>
          <p className="page-subtitle">A year of color across your garden, month by month.</p>
        </div>
      </div>

      <div className="garden-controls">
        <div className="garden-controls__group">
          <select className="text-input" style={{ width: 'auto' }} value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}>
            <option value="all">All zones</option>
            {zones.map((z) => (
              <option key={z.id} value={String(z.id)}>
                {z.name}
              </option>
            ))}
          </select>
          <select className="text-input" style={{ width: 'auto' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All plant types</option>
            {plantTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />}

      {!isLoading && rows.length === 0 && (
        <div className="empty-state">
          <h3>No bloom data yet</h3>
          <p>Add plants with a bloom window to see them appear on the calendar.</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="bloom-calendar panel">
          <div className="bloom-calendar__header">
            <div className="bloom-calendar__label-col" />
            {MONTH_LABELS.map((m, i) => (
              <div key={m} className={'bloom-calendar__month-head' + (i + 1 === currentMonth ? ' bloom-calendar__month-head--now' : '')}>
                {m}
              </div>
            ))}
          </div>
          {rows.map((p) => {
            const s = p.bloom_start_month!;
            const e = p.bloom_end_month!;
            const wraps = s > e;
            const color = plantColor(p.primary_color);
            return (
              <div className="bloom-calendar__row" key={p.plant_id}>
                <Link to={`/plants/${p.plant_id}`} className="bloom-calendar__label">
                  <span className="plant-row__dot" style={{ background: color }} />
                  {p.common_name}
                </Link>
                <div className="bloom-calendar__track">
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = i + 1;
                    const active = wraps ? m >= s || m <= e : m >= s && m <= e;
                    return (
                      <div
                        key={m}
                        className={'bloom-calendar__cell' + (m === currentMonth ? ' bloom-calendar__cell--now' : '')}
                      >
                        {active && <div className="bloom-calendar__bar" style={{ background: color }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
