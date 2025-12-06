import * as React from 'react'
import { cn } from '@/lib/utils'

function Alert({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        variant === 'destructive' && 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription }

