"use client"

import React, { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onRightIconClick?: () => void
  containerClassName?: string
}

const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  containerClassName,
  className,
  id,
  ...props
}) => {
  const hasLeft = Boolean(leftIcon)
  const hasRight = Boolean(rightIcon)

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {hasLeft && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`lux-input w-full ${hasLeft ? 'pl-10' : ''} ${hasRight ? 'pr-12' : ''} ${className || ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {hasRight && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
            aria-label="toggle"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs text-secondary">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs" style={{ color: 'var(--accent-red)' }}>{error}</p>
      )}
    </div>
  )
}

export default Input