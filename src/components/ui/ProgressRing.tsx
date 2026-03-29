import { colors } from '../../design-system';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ProgressRing({
  percent,
  size = 56,
  strokeWidth = 3,
  color = colors.neonLime,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.max(0, Math.min(100, percent)) / 100);

  return (
    <svg
      width={size}
      height={size}
      className="progress-ring"
      aria-label={`${Math.round(percent)}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="progress-ring-track"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.22}
        fontFamily="'Sora', sans-serif"
        fontWeight={300}
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}
