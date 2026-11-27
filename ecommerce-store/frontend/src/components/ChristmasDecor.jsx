// Festive decorations for the Christmas page: a string of lights, pine sprigs
// with berries, and gift-tag labels. Colors stay close to the ACE palette.

export const XMAS = {
  red: '#d8433b',
  green: '#2f8f5b',
  gold: '#e9b44c',
  blue: '#3d7ff5'
};

const BULB_COLORS = [XMAS.red, XMAS.gold, XMAS.green, XMAS.blue];

/*
  A string of fairy lights draped in swags across the full width.
  The wire stretches with the page; the bulbs sit on it at fixed fractions.
*/
export const ChristmasLights = ({ swags = 6, className = '' }) => {
  const top = 6;
  const sag = 22; // how far each swag dips, in px
  const bulbs = [];
  for (let s = 0; s < swags; s += 1) {
    [0.22, 0.5, 0.78].forEach((f, i) => {
      bulbs.push({
        left: ((s + f) / swags) * 100,
        top: top + sag * 4 * f * (1 - f),
        color: BULB_COLORS[(s * 3 + i) % BULB_COLORS.length],
        delay: `${((s * 3 + i) * 0.37) % 2.4}s`
      });
    });
  }
  const segment = 1200 / swags;
  const path = Array.from({ length: swags }, (_, s) => {
    const x0 = s * segment;
    return `M${x0} ${top} Q${x0 + segment / 2} ${top + sag * 2} ${x0 + segment} ${top}`;
  }).join(' ');

  return (
    <div className={`pointer-events-none relative h-14 w-full ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 56" preserveAspectRatio="none" fill="none">
        <path d={path} stroke="#2b3a33" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {bulbs.map((bulb, index) => (
        <span
          key={index}
          className="absolute flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${bulb.left}%`, top: bulb.top - 2 }}
        >
          <span className="h-1.5 w-1.5 rounded-[1px] bg-[#2b3a33]" />
          <span
            className="xmas-bulb h-3.5 w-2.5 rounded-b-full rounded-t-[40%]"
            style={{ background: bulb.color, color: bulb.color, animationDelay: bulb.delay }}
          />
        </span>
      ))}
    </div>
  );
};

/* A small pine sprig with three red berries, for corners. */
export const PineSprig = ({ className = '', flip = false }) => (
  <svg
    className={`pointer-events-none ${className}`}
    viewBox="0 0 120 80"
    fill="none"
    aria-hidden="true"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    {/* needles: two shades, dense along the stem */}
    {[
      { color: '#1f6b42', width: 2.8, len: 15, offset: 0.5 },
      { color: XMAS.green, width: 2.4, len: 13, offset: 0 }
    ].map((layer) => (
      <g key={layer.color} stroke={layer.color} strokeWidth={layer.width} strokeLinecap="round">
        {Array.from({ length: 16 }).map((_, i) => {
          const t = (i + layer.offset) / 16;
          const x = 6 + t * 104;
          const y = 10 + t * t * 52 + t * 4;
          const l = layer.len * (1 - t * 0.35);
          return (
            <g key={i}>
              <path d={`M${x} ${y} l${-l * 0.45} ${-l * 0.9}`} />
              <path d={`M${x} ${y} l${l * 0.75} ${l * 0.55}`} />
            </g>
          );
        })}
      </g>
    ))}
    <path d="M4 10 C40 22, 70 34, 112 66" stroke="#5b3a24" strokeWidth="2" strokeLinecap="round" />
    <circle cx="58" cy="40" r="5" fill={XMAS.red} />
    <circle cx="66" cy="46" r="4.5" fill={XMAS.red} />
    <circle cx="55" cy="49" r="4" fill="#b8322b" />
    <circle cx="56.5" cy="38.5" r="1.4" fill="#fff" opacity="0.7" />
  </svg>
);

/* A gift tag: a pill with a notched end and a punched hole. */
export const GiftTag = ({ children, color = XMAS.red }) => (
  <span className="gift-tag inline-flex items-center gap-2 py-1 pl-5 pr-3 text-xs font-semibold uppercase tracking-[0.12em] text-white" style={{ background: color }}>
    {children}
  </span>
);
