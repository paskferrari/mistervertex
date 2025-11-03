"use client"

import React, { SelectHTMLAttributes } from 'react'

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  containerClassName?: string
}

const Select: React.FC<SelectProps> = ({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  children,
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`lux-select w-full ${className || ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs text-secondary">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs" style={{ color: 'var(--accent-red)' }}>{error}</p>
      )}
    </div>
  )
}

export default Select