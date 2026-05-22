interface DecoMarkProps {
  className?: string;
  stroke?: string;
  strokeOpacity?: number;
}

/** Hex strokes — SVG attributes do not reliably resolve CSS variables. */
const DEFAULT_PURPLE = "#8c52ff";
const DEFAULT_LIME = "#a6ff00";

/** Radiating line burst (48×48 viewBox). */
export function TitleDecoMark({
  className,
  stroke = DEFAULT_PURPLE,
  strokeOpacity = 0.45,
}: DecoMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width="48"
      height="48"
      aria-hidden
    >
      <g
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="24" y1="2" x2="24" y2="14" />
        <line x1="24" y1="34" x2="24" y2="46" />
        <line x1="2" y1="24" x2="14" y2="24" />
        <line x1="34" y1="24" x2="46" y2="24" />
        <line x1="8.4" y1="8.4" x2="16.5" y2="16.5" />
        <line x1="31.5" y1="31.5" x2="39.6" y2="39.6" />
        <line x1="8.4" y1="39.6" x2="16.5" y2="31.5" />
        <line x1="31.5" y1="16.5" x2="39.6" y2="8.4" />
        <line x1="5" y1="16" x2="15" y2="20" />
        <line x1="33" y1="28" x2="43" y2="32" />
        <line x1="5" y1="32" x2="15" y2="28" />
        <line x1="33" y1="20" x2="43" y2="16" />
        <line x1="16" y1="5" x2="20" y2="15" />
        <line x1="28" y1="33" x2="32" y2="43" />
        <line x1="32" y1="5" x2="28" y2="15" />
        <line x1="20" y1="33" x2="16" y2="43" />
      </g>
    </svg>
  );
}

/** Compact sun burst (24×24 viewBox). */
export function SparkDecoMark({
  className,
  stroke = DEFAULT_PURPLE,
  strokeOpacity = 0.45,
}: DecoMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth="1.5"
      />
      <g
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="12" y1="1" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </g>
    </svg>
  );
}

export { DEFAULT_LIME, DEFAULT_PURPLE };
