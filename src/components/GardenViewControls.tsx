import type { EditorMode, ViewMode } from '../state/editorStore';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'plants', label: 'Plants' },
  { id: 'sunlight', label: 'Sunlight' },
  { id: 'watering', label: 'Watering' },
  { id: 'bloom', label: 'Bloom' },
];

const EDIT_MODES: { id: EditorMode; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'edit-layout', label: 'Edit Layout' },
  { id: 'add-area', label: 'Add Area' },
  { id: 'add-plant', label: 'Add Plant' },
];

interface Props {
  activeView: ViewMode;
  onViewChange: (v: ViewMode) => void;
  editorMode: EditorMode;
  onModeChange: (m: EditorMode) => void;
  showEditControls?: boolean;
}

export default function GardenViewControls({ activeView, onViewChange, editorMode, onModeChange, showEditControls = true }: Props) {
  return (
    <div className="garden-controls">
      <div className="garden-controls__group" role="group" aria-label="View mode">
        {VIEW_MODES.map((v) => (
          <button
            key={v.id}
            type="button"
            className={'chip' + (activeView === v.id ? ' chip--active' : '')}
            aria-pressed={activeView === v.id}
            onClick={() => onViewChange(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      {showEditControls && (
        <div className="garden-controls__group" role="group" aria-label="Editor mode">
          {EDIT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={'chip chip--outline' + (editorMode === m.id ? ' chip--active' : '')}
              aria-pressed={editorMode === m.id}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
