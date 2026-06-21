import { formatPrice } from '../utils/formatters';

const PriceRangeSlider = ({ bounds, value, onChange }) => {
  const current = value ?? bounds;
  const span = bounds.max - bounds.min || 1;
  const step = Math.max(1, Math.round(span / 100));

  const minPct = ((current.min - bounds.min) / span) * 100;
  const maxPct = ((current.max - bounds.min) / span) * 100;

  const handleMinChange = (event) => {
    const next = Math.min(Number(event.target.value), current.max - step);
    onChange({ min: next, max: current.max });
  };

  const handleMaxChange = (event) => {
    const next = Math.max(Number(event.target.value), current.min + step);
    onChange({ min: current.min, max: next });
  };

  return (
    <div className="space-y-3">
      <div className="relative h-4">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={current.min}
          onChange={handleMinChange}
          className="range-thumb z-10"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={current.max}
          onChange={handleMaxChange}
          className="range-thumb z-20"
          aria-label="Maximum price"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{formatPrice(current.min)}</span>
        <span>
          {formatPrice(current.max)}
          {current.max >= bounds.max ? '+' : ''}
        </span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
