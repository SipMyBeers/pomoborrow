"use client";

interface TimerRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export function TimerRing({
  progress,
  size = 280,
  strokeWidth = 10,
  color = "var(--primary)",
  bgColor = "var(--ring-bg, hsl(240 3.7% 15.9%))",
  children,
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface DayRingProps {
  sessions: Array<{ startedAt: number; duration: number; mode: string }>;
  size?: number;
}

export function DayRing({ sessions, size = 280 }: DayRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2 - 20) / 2; // Inner ring
  const circumference = 2 * Math.PI * radius;

  // Map sessions to ring segments
  const segments = sessions
    .filter((s) => s.mode === "focus")
    .map((s) => {
      const start = new Date(s.startedAt);
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const startAngle = (startMinutes / 1440) * circumference;
      const length = (s.duration / 86400) * circumference; // duration as fraction of 24h
      return { offset: circumference - startAngle, length };
    });

  // Current time marker
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowAngle = (nowMinutes / 1440) * 360;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 w-full h-full -rotate-90"
      style={{ opacity: 0.3 }}
    >
      {/* 24h background */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.05}
        strokeWidth={strokeWidth}
      />
      {/* Hour markers */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x1 = size / 2 + (radius - 8) * Math.cos(rad);
        const y1 = size / 2 + (radius - 8) * Math.sin(rad);
        const x2 = size / 2 + (radius + 2) * Math.cos(rad);
        const y2 = size / 2 + (radius + 2) * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity={i % 6 === 0 ? 0.15 : 0.05}
            strokeWidth={i % 6 === 0 ? 1.5 : 0.5}
          />
        );
      })}
      {/* Focus session segments */}
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(0 84.2% 60.2%)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${seg.length} ${circumference - seg.length}`}
          strokeDashoffset={seg.offset}
          strokeOpacity={0.6}
        />
      ))}
      {/* Current time needle */}
      {(() => {
        const rad = ((nowAngle - 90) * Math.PI) / 180;
        const x = size / 2 + (radius - 12) * Math.cos(rad);
        const y = size / 2 + (radius - 12) * Math.sin(rad);
        const x2 = size / 2 + (radius + 4) * Math.cos(rad);
        const y2 = size / 2 + (radius + 4) * Math.sin(rad);
        return (
          <line
            x1={x}
            y1={y}
            x2={x2}
            y2={y2}
            stroke="hsl(0 84.2% 60.2%)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeOpacity={0.8}
          />
        );
      })()}
    </svg>
  );
}
