import { Route, Routes } from 'react-router-dom';
import AppShell from './routes/AppShell';
import DashboardPage from './routes/DashboardPage';
import GardenPage from './routes/GardenPage';
import PlantsPage from './routes/PlantsPage';
import PlantDetailPage from './routes/PlantDetailPage';
import CalendarPage from './routes/CalendarPage';
import TasksPage from './routes/TasksPage';
import SettingsPage from './routes/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/plants" element={<PlantsPage />} />
        <Route path="/plants/:id" element={<PlantDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
