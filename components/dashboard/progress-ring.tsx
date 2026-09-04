'use client'

import { cn } from '@/lib/utils'

export function ProgressRing({
  value,
  max,
  size = 72,
  stroke = 8,
  color,
  trackClassName,
  children,
  className,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  /** css color, e.g. var(--protein) */
  color: string
  trackClassName?: string
  children?: React.ReactNode
  className?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(1, value / max) : 0
  const offset = circumference * (1 - pct)
  const over = max > 0 && value > max

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn('text-muted', trackClassName)}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={over ? 'var(--destructive)' : color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
