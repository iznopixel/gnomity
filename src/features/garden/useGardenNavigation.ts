import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ViewMode } from '../../state/editorStore';

export interface GardenNavTarget {
  plantId?: number;
  zoneId?: number;
  view?: ViewMode;
  month?: number;
}

// Reusable mechanism (spec #17) for jumping into /garden with context, from
// Plant Detail, Tasks, Dashboard, or the Bloom Calendar.
export function useGardenNavigation() {
  const navigate = useNavigate();
  return useCallback(
    (target: GardenNavTarget) => {
      const params = new URLSearchParams();
      if (target.plantId != null) params.set('plant', String(target.plantId));
      if (target.zoneId != null) params.set('zone', String(target.zoneId));
      if (target.view) params.set('view', target.view);
      if (target.month != null) params.set('month', String(target.month));
      navigate(`/garden?${params.toString()}`);
    },
    [navigate]
  );
}
