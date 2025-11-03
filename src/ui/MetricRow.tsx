import React from 'react';

type MetricRowProps = {
  label: string;
  value: string | number;
  trend?: number; // positive/negative percentage
  className?: string;
};

export default function MetricRow({ label, value, trend, className = '' }: MetricRowProps) {
  const trendLabel = typeof trend === 'number' ? `${trend > 0 ? '+' : ''}${trend}%` : undefined;
  return (
    <div className={`metric-row ${className}`.trim()}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {value}
        {trendLabel && (
          <span style={{ marginLeft: 8, color: trend && trend < 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{trendLabel}</span>
        )}
      </span>
    </div>
  );
}