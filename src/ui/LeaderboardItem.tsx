import React from 'react';

type LeaderboardItemProps = {
  rank: number;
  name: string;
  metric: string;
  avatarUrl?: string;
  className?: string;
};

export default function LeaderboardItem({ rank, name, metric, avatarUrl, className = '' }: LeaderboardItemProps) {
  return (
    <div className={`leaderboard-item ${className}`.trim()}>
      <div className="rank">{rank}</div>
      <div className="profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-color)' }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }} />
        )}
        <div>
          <div className="name" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{name}</div>
          <div className="metric" style={{ color: 'var(--text-secondary)' }}>{metric}</div>
        </div>
      </div>
    </div>
  );
}