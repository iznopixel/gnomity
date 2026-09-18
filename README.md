# gnomity — Gnome Home

Home garden planner, tracker, and modeler. See how much sunlight a patch in the backyard gets, know when to be on the lookout for specific blooms, and stay on top of watering thirsty plants.

A React + TypeScript + Vite frontend for the Xano-backed "Gnome Home" API (`openapi/spec.json`), built around an interactive SVG garden model rather than a conventional CRUD dashboard.

## Getting started

```bash
npm install
npm run dev
```

The app talks to the demo backend at `openapi/spec.json`'s server URL by default. Override it with `VITE_API_BASE_URL` (see `.env.example`) if you point it at a different Xano instance.

## Project layout

```
src/
  api/         typed fetch client + one function per OpenAPI endpoint
  models/      domain types + the frontend's normalized geometry schema
  state/       zustand editor store (mode, view, month, selection, drag)
  hooks/       TanStack Query hooks (server state)
  features/    garden/plants/calendar/tasks feature logic + panels
  components/  GardenCanvas (the SVG modeling engine) and shared UI
  routes/      one file per route (Dashboard, Garden, Plants, ...)
  styles/      CSS design tokens + per-area stylesheets
```

## Known backend limitation

On the current demo Xano deployment, every endpoint that joins the `garden_plants` table (placing/listing garden plants, the dashboard, season, bloom-calendar, map, and task-list endpoints) returns `ERROR_CODE_INPUT_ERROR: "Unsupported param format"`. Plain endpoints (gardens, zones, objects, plant catalog, task creation) work correctly. The frontend is built to the full OpenAPI contract and degrades gracefully when these calls fail (empty/error states instead of crashing) so the rest of the app — and plant placement — will "just work" once that backend issue is fixed.
