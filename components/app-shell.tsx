'use client'

import { useState } from 'react'
import { LayoutDashboard, Camera, Plus, TrendingUp, ScrollText, Settings, Leaf } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Dashboard } from '@/components/dashboard/dashboard'
import { FoodScanner } from '@/components/scan/food-scanner'
import { AddPanel } from '@/components/add/add-panel'
import { MealLog } from '@/components/history/meal-log'
import { Trends } from '@/components/trends/trends'
import { SettingsDrawer } from '@/components/settings/settings-drawer'
import { cn } from '@/lib/utils'

type Tab = 'dashboard' | 'scan' | 'add' | 'log' | 'trends'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'scan', label: 'Scan', icon: Camera },
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'log', label: 'Log', icon: ScrollText },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
]

export function AppShell() {
  const { hydrated } = useStore()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </div>
          <div className="leading-none">
            <h1 className="font-serif text-lg font-semibold tracking-tight">NutriLens</h1>
            <p className="text-[11px] text-muted-foreground">AI calorie & macro tracker</p>
          </div>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Open settings"
        >
          <Settings className="size-5" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-28 pt-4">
        {!hydrated ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Loading your data…
          </div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <Dashboard
                onScan={() => setTab('scan')}
                onAdd={() => setTab('add')}
                onTrends={() => setTab('trends')}
              />
            )}
            {tab === 'scan' && <FoodScanner onOpenSettings={() => setSettingsOpen(true)} />}
            {tab === 'add' && <AddPanel />}
            {tab === 'log' && <MealLog />}
            {tab === 'trends' && <Trends />}
          </>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-lg border-t border-border bg-background/90 backdrop-blur-md">
        <div className="grid grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            const isScan = id === 'scan'
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full transition-all',
                    isScan
                      ? 'size-9 bg-primary text-primary-foreground shadow-sm'
                      : active
                        ? 'size-7 text-primary'
                        : 'size-7',
                  )}
                >
                  <Icon className={cn(isScan ? 'size-5' : 'size-5')} />
                </span>
                {label}
              </button>
            )
          })}
        </div>
      </nav>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
