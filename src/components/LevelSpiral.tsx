interface LevelSpiralProps {
  level: number;
  mentalScore: number; // 0-100, drives the inner arc fill
}

/**
 * The one deliberately "designed" element in this Phase 1 shell (see
 * frontend-design skill: spend boldness in one place, keep the rest
 * quiet). Two concentric arcs: the outer gold ring is purely decorative
 * (echoes "berputar sambil naik"), the inner arc fills proportionally
 * with Mental Score so the number in the center never has to explain
 * itself with extra text.
 */
export function LevelSpiral({ level, mentalScore }: LevelSpiralProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const innerRadius = 58;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const fillFraction = Math.max(0, Math.min(100, mentalScore)) / 100;

  return (
    <svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label={`Level ${level}`}>
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.78} ${circumference}`}
        transform="rotate(-125 100 100)"
        opacity="0.9"
      />
      <circle
        cx="100"
        cy="100"
        r={innerRadius}
        fill="none"
        stroke="var(--border)"
        strokeWidth="6"
      />
      <circle
        cx="100"
        cy="100"
        r={innerRadius}
        fill="none"
        stroke={mentalScore < 40 ? 'var(--signal-critical)' : 'var(--signal-good)'}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${innerCircumference * fillFraction} ${innerCircumference}`}
        transform="rotate(-90 100 100)"
      />
      <text
        x="100"
        y="94"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="44"
        fontWeight="600"
        fill="var(--text)"
      >
        {level}
      </text>
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="2"
        fill="var(--text-dim)"
      >
        PUTARAN
      </text>
    </svg>
  );
}
