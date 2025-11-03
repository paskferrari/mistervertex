import React from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  as?: 'button' | 'a';
  href?: string;
  className?: string;
  onClick?: React.MouseEventHandler;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
};

export default function Button({ variant = 'primary', as = 'button', href, className = '', onClick, children, type = 'button' }: ButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const cls = `${base} ${className}`.trim();
  if (as === 'a') {
    return (
      <a href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} onClick={onClick} type={type}>
      {children}
    </button>
  );
}