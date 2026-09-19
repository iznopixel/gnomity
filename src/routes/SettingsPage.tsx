import { useEffect, useState } from 'react';
import { useActiveGarden } from '../hooks/queries';
import { updateGarden } from '../api/gardens';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
  const gardenQuery = useActiveGarden();
  const garden = gardenQuery.data;
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    location_name: '',
    hardiness_zone: '',
    last_frost_date: '',
    first_frost_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (garden) {
      setForm({
        name: garden.name ?? '',
        location_name: garden.location_name ?? '',
        hardiness_zone: garden.hardiness_zone ?? '',
        last_frost_date: garden.last_frost_date ?? '',
        first_frost_date: garden.first_frost_date ?? '',
      });
    }
  }, [garden]);

  if (gardenQuery.isLoading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </div>
    );
  }

  if (!garden) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-header__eyebrow">Garden Settings</span>
          <h1>{garden.name}</h1>
          <p className="page-subtitle">Basic details about your garden and climate.</p>
        </div>
      </div>

      <form
        className="panel settings-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await updateGarden(garden.id, form);
            await qc.invalidateQueries({ queryKey: ['active-garden'] });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          } finally {
            setSaving(false);
          }
        }}
      >
        <label className="field">
          <span>Garden name</span>
          <input className="text-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </label>
        <label className="field">
          <span>Location</span>
          <input
            className="text-input"
            value={form.location_name}
            onChange={(e) => setForm((f) => ({ ...f, location_name: e.target.value }))}
            placeholder="City, region"
          />
        </label>
        <label className="field">
          <span>Hardiness zone</span>
          <input
            className="text-input"
            value={form.hardiness_zone}
            onChange={(e) => setForm((f) => ({ ...f, hardiness_zone: e.target.value }))}
            placeholder="e.g. 7b"
          />
        </label>
        <label className="field">
          <span>Last frost date</span>
          <input
            className="text-input"
            value={form.last_frost_date}
            onChange={(e) => setForm((f) => ({ ...f, last_frost_date: e.target.value }))}
            placeholder="e.g. April 15"
          />
        </label>
        <label className="field">
          <span>First frost date</span>
          <input
            className="text-input"
            value={form.first_frost_date}
            onChange={(e) => setForm((f) => ({ ...f, first_frost_date: e.target.value }))}
            placeholder="e.g. October 20"
          />
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="page-subtitle">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
