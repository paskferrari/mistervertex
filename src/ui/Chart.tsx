import React from 'react';

type ChartProps = {
  points?: number[]; // values from 0 to 1
  className?: string;
};

export default function Chart({ points = [0.2, 0.3, 0.25, 0.5, 0.6, 0.55, 0.7, 0.9], className = '' }: ChartProps) {
  const width = 600;
  const height = 200;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - p * height}`)
    .join(' ');

  return (
    <div className={`chart-container ${className}`.trim()}>
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#f4d03f" />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.35)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth={3} />
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="url(#fillGrad)" opacity={0.25} />
      </svg>
    </div>
  );
}