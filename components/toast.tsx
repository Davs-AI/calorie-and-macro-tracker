'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const accents: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-water',
  warning: 'text-warning',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    (t) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { ...t, id }])
      setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  const helpers = {
    toast,
    success: (title: string, description?: string) => toast({ type: 'success', title, description }),
    error: (title: string, description?: string) => toast({ type: 'error', title, description }),
    info: (title: string, description?: string) => toast({ type: 'info', title, description }),
    warning: (title: string, description?: string) => toast({ type: 'warning', title, description }),
  }

  return (
    <ToastContext.Provider value={helpers}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:right-0 sm:left-auto sm:top-0 sm:items-end">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-popover p-3.5 text-popover-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-top-2"
            >
              <Icon className={cn('mt-0.5 size-5 shrink-0', accents[t.type])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground leading-snug">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
