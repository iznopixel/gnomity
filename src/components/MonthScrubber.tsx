import { MONTH_LABELS } from '../state/editorStore';

interface MonthScrubberProps {
  month: number; // 1-12
  onChange: (month: number) => void;
}

export default function MonthScrubber({ month, onChange }: MonthScrubberProps) {
  const currentMonth = new Date().getMonth() + 1;
  return (
    <div className="month-scrubber" role="group" aria-label="Select month">
      {MONTH_LABELS.map((label, idx) => {
        const m = idx + 1;
        const active = m === month;
        const isNow = m === currentMonth;
        return (
          <button
            key={label}
            type="button"
            className={'month-scrubber__month' + (active ? ' month-scrubber__month--active' : '')}
            aria-pressed={active}
            onClick={() => onChange(m)}
          >
            <span>{label}</span>
            {isNow && <span className="month-scrubber__now" aria-label="Current month" />}
          </button>
        );
      })}
      <div
        className="month-scrubber__indicator"
        style={{ left: `${((month - 1) / 12) * 100}%`, width: `${100 / 12}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
