import React from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export default function Card({ title, subtitle, actions, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`.trim()}>
      {(title || actions) && (
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {title && (
            <div>
              <h3 style={{ margin: 0 }} className="text-primary">
                {title}
              </h3>
              {subtitle && (
                <p style={{ marginTop: 4 }} className="text-secondary">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}