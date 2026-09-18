import { useState } from 'react';
import { useActiveGarden, useTasks, useUpdateTask } from '../hooks/queries';
import { useGardenScene } from '../features/garden/useGardenScene';
import { useGardenNavigation } from '../features/garden/useGardenNavigation';

const TASK_TYPE_LABEL: Record<string, string> = {
  water: 'Water',
  deadhead: 'Deadhead',
  prune: 'Prune',
  divide: 'Divide',
  fertilize: 'Fertilize',
  transplant: 'Transplant',
  plant: 'Plant',
  custom: 'Task',
};

export default function TasksPage() {
  const gardenQuery = useActiveGarden();
  const gardenId = gardenQuery.data?.id;
  const [statusFilter, setStatusFilter] = useState<'open' | 'completed'>('open');
  const tasksQuery = useTasks(gardenId, { status: statusFilter });
  const updateTask = useUpdateTask(gardenId);
  const { zones, plants } = useGardenScene();
  const goToGarden = useGardenNavigation();

  const tasks = tasksQuery.data ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-header__eyebrow">Garden Maintenance</span>
          <h1>Tasks</h1>
          <p className="page-subtitle">A light-touch list of what your garden needs next.</p>
        </div>
      </div>

      <div className="garden-controls">
        <div className="garden-controls__group" role="group" aria-label="Filter tasks">
          <button
            type="button"
            className={'chip' + (statusFilter === 'open' ? ' chip--active' : '')}
            onClick={() => setStatusFilter('open')}
          >
            Open
          </button>
          <button
            type="button"
            className={'chip' + (statusFilter === 'completed' ? ' chip--active' : '')}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {tasksQuery.isLoading && <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />}

      {tasksQuery.isError && (
        <div className="error-banner">
          Tasks couldn&rsquo;t be loaded right now. The backend&rsquo;s task listing endpoint is currently
          returning an error for this demo garden; creating and completing tasks still works once data loads.
        </div>
      )}

      {!tasksQuery.isLoading && !tasksQuery.isError && tasks.length === 0 && (
        <div className="empty-state">
          <h3>{statusFilter === 'open' ? 'Nothing pending' : 'No completed tasks yet'}</h3>
          <p>{statusFilter === 'open' ? 'Your garden is caught up.' : 'Complete a task and it will show here.'}</p>
        </div>
      )}

      <ul className="task-list">
        {tasks.map((task) => {
          const zone = zones.find((z) => z.id === task.zone_id);
          const plant = plants.find((p) => p.id === task.garden_plant_id);
          return (
            <li key={task.id} className="task-row panel">
              <button
                type="button"
                className={'task-row__check' + (statusFilter === 'completed' ? ' task-row__check--done' : '')}
                aria-label={statusFilter === 'completed' ? 'Mark as open' : 'Mark as complete'}
                onClick={() =>
                  updateTask.mutate({ id: task.id, body: { is_completed: statusFilter !== 'completed' } })
                }
              >
                {statusFilter === 'completed' ? '✓' : ''}
              </button>
              <div className="task-row__body">
                <div className="task-row__title">{task.title}</div>
                <div className="task-row__meta">
                  <span className="tag">{TASK_TYPE_LABEL[task.task_type] ?? task.task_type}</span>
                  {task.due_date && <span className="page-subtitle">Due {task.due_date}</span>}
                  {zone && <span className="page-subtitle">{zone.name}</span>}
                  {plant && <span className="page-subtitle">{plant.nickname || plant.common_name}</span>}
                </div>
                {task.notes && <p className="page-subtitle">{task.notes}</p>}
              </div>
              {(task.zone_id || task.garden_plant_id) && (
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() =>
                    goToGarden({
                      zoneId: task.zone_id ?? undefined,
                      plantId: task.garden_plant_id ?? undefined,
                      view: task.task_type === 'water' ? 'watering' : 'plants',
                    })
                  }
                >
                  View Location
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
