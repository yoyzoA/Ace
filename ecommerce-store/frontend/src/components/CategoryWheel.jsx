import { useMemo, useState } from 'react';

const truncate = (label, max) => (label.length > max ? `${label.slice(0, max - 1)}…` : label);

const CategoryWheel = ({ categories, value, onChange, size = 216 }) => {
  const [hovered, setHovered] = useState(null);

  const center = size / 2;
  const radius = size * 0.36;
  const nodeSize = size * 0.2;
  const hubSize = size * 0.3;
  const labelMax = Math.round(size / 24);

  const nodes = useMemo(
    () =>
      categories.map((category, index) => {
        const angle = (index / categories.length) * Math.PI * 2 - Math.PI / 2;
        return {
          id: category,
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle)
        };
      }),
    [categories, center, radius]
  );

  const isAll = value === 'all';
  const activeNode = nodes.find((node) => node.id === value);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full border border-dashed border-line/60 animate-wheel-spin" />
        <div className="absolute inset-3 rounded-full border border-line/40" />

        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
        >
          {nodes.map((node) => {
            const active = node.id === value;
            return (
              <line
                key={node.id}
                x1={center}
                y1={center}
                x2={node.x}
                y2={node.y}
                stroke={active ? 'var(--color-accent)' : 'var(--color-line)'}
                strokeWidth={active ? 2 : 1}
                strokeOpacity={active ? 0.9 : 0.45}
                style={
                  active
                    ? { filter: 'drop-shadow(0 0 6px rgba(40,167,225,0.8))' }
                    : undefined
                }
              />
            );
          })}
        </svg>

        <button
          type="button"
          onClick={() => onChange('category', 'all')}
          aria-pressed={isAll}
          className={`absolute flex flex-col items-center justify-center rounded-full border text-center transition ${
            isAll
              ? 'border-accent bg-panelStrong text-accent shadow-glow'
              : 'border-line bg-panelStrong text-ink hover:border-accent/60'
          }`}
          style={{
            width: hubSize,
            height: hubSize,
            left: center,
            top: center,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">
            {isAll ? 'Viewing' : 'Reset to'}
          </span>
          <span className="text-[11px] font-semibold leading-tight">All</span>
        </button>

        {nodes.map((node) => {
          const active = node.id === value;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onChange('category', node.id)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
              onBlur={() => setHovered(null)}
              aria-pressed={active}
              title={node.id}
              className={`absolute flex items-center justify-center rounded-full border text-[9px] font-semibold uppercase tracking-wide transition ${
                active
                  ? 'border-accent bg-accent text-canvas shadow-glow'
                  : 'border-line bg-panel text-muted hover:border-accent/70 hover:text-accent'
              }`}
              style={{
                width: nodeSize,
                height: nodeSize,
                left: node.x,
                top: node.y,
                transform: `translate(-50%, -50%) scale(${
                  active || hovered === node.id ? 1.1 : 1
                })`
              }}
            >
              <span className="px-1 text-center leading-tight">
                {truncate(node.id, labelMax)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="h-4 text-xs text-muted">
        {hovered ?? (isAll ? 'All categories' : activeNode?.id)}
      </p>
    </div>
  );
};

export default CategoryWheel;
