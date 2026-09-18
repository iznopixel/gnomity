import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import GardenCanvas from '../components/GardenCanvas';
import { useGardenScene } from '../features/garden/useGardenScene';
import { useTasks } from '../hooks/queries';
import { useGardenNavigation } from '../features/garden/useGardenNavigation';
import {
  isPlantBloomingInMonth,
  isPlantComingSoon,
  plantColor,
  zoneWatersManually,
} from '../features/garden/sceneHelpers';
import { MONTH_LABELS } from '../state/editorStore';
import { useEditorStore } from '../state/editorStore';

export default function DashboardPage() {
  const { garden, gardenId, zones, objects, plants, isLoading, isError } = useGardenScene();
  const tasksQuery = useTasks(gardenId, { status: 'open' });
  const goToGarden = useGardenNavigation();
  const { activeView, select } = useEditorStore();
  const month = new Date().getMonth() + 1;

  const bloomingNow = useMemo(() => plants.filter((p) => isPlantBloomingInMonth(p, month)), [plants, month]);
  const comingSoon = useMemo(() => plants.filter((p) => isPlantComingSoon(p, month)), [plants, month]);
  const manualZones = useMemo(() => zones.filter(zoneWatersManually), [zones]);
  const openTasks = tasksQuery.data ?? [];

  if (isLoading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 420, borderRadius: 20 }} />
      </div>
    );
  }

  if (isError || !garden) {
    return (
      <div className="page">
        <div className="error-banner">Could not load your garden dashboard.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-header__eyebrow">Right now, in your garden</span>
          <h1>{garden.name}</h1>
          <p className="page-subtitle">
            {bloomingNow.length > 0
              ? `${bloomingNow.length} plant${bloomingNow.length === 1 ? '' : 's'} blooming this month.`
              : 'Nothing in bloom this month — check back soon.'}
          </p>
        </div>
        <Link to="/garden" className="btn btn--primary">
          Open Full Garden
        </Link>
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-map panel">
          <GardenCanvas
            zones={zones}
            objects={objects}
            plants={plants}
            viewMode={activeView}
            month={month}
            mode="explore"
            selected={null}
            onSelect={(obj) => {
              select(obj);
              goToGarden({ zoneId: obj?.kind === 'zone' ? obj.id : undefined, plantId: obj?.kind === 'plant' ? obj.id : undefined });
            }}
          />
        </div>

        <div className="dashboard-side">
          <section className="panel dashboard-card">
            <p className="section-title">Needs Attention</p>
            {openTasks.length === 0 && manualZones.length === 0 && (
              <p className="page-subtitle">Everything is caught up.</p>
            )}
            {manualZones.length > 0 && (
              <button
                type="button"
                className="attention-row"
                onClick={() => goToGarden({ view: 'watering' })}
              >
                <span className="tag tag--clay">{manualZones.length} manual</span>
                <span>{manualZones.length} bed{manualZones.length === 1 ? '' : 's'} need hand watering</span>
              </button>
            )}
            {openTasks.slice(0, 4).map((t) => (
              <Link key={t.id} to="/tasks" className="attention-row">
                <span className="tag">{t.task_type}</span>
                <span>{t.title}</span>
              </Link>
            ))}
            {openTasks.length > 4 && (
              <Link to="/tasks" className="page-subtitle">
                +{openTasks.length - 4} more tasks
              </Link>
            )}
          </section>

          <section className="panel dashboard-card">
            <p className="section-title">Blooming Now</p>
            {bloomingNow.length === 0 && <p className="page-subtitle">No active blooms this month.</p>}
            {bloomingNow.slice(0, 5).map((p) => (
              <button
                key={p.id}
                type="button"
                className="plant-row"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                onClick={() => goToGarden({ plantId: p.id, view: 'bloom' })}
              >
                <span className="plant-row__dot" style={{ background: plantColor(p.primary_color) }} />
                <span className="plant-row__name">{p.common_name}</span>
              </button>
            ))}
          </section>

          <section className="panel dashboard-card">
            <p className="section-title">Coming Soon</p>
            {comingSoon.length === 0 && <p className="page-subtitle">Nothing scheduled to bloom in the next two months.</p>}
            {comingSoon.slice(0, 5).map((p) => (
              <div key={p.id} className="plant-row">
                <span className="plant-row__dot" style={{ background: plantColor(p.primary_color), opacity: 0.5 }} />
                <span className="plant-row__name">{p.common_name}</span>
              </div>
            ))}
          </section>
        </div>
      </div>

      <section className="panel dashboard-card" style={{ marginTop: 'var(--space-5)' }}>
        <p className="section-title">Garden Year</p>
        <div className="mini-year">
          {MONTH_LABELS.map((label, i) => {
            const m = i + 1;
            const count = plants.filter((p) => isPlantBloomingInMonth(p, m)).length;
            return (
              <div key={label} className={'mini-year__month' + (m === month ? ' mini-year__month--now' : '')}>
                <div className="mini-year__bar" style={{ height: `${8 + count * 6}px` }} />
                <span>{label[0]}</span>
              </div>
            );
          })}
        </div>
        <Link to="/calendar" className="btn btn--sm" style={{ marginTop: 12 }}>
          View full bloom calendar
        </Link>
      </section>
    </div>
  );
}
