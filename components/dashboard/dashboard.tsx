'use client'

import { useMemo } from 'react'
import { Camera, Flame, Plus, TrendingUp, Utensils } from 'lucide-react'
import { Card } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { ProgressRing } from './progress-ring'
import { WaterTracker } from './water-tracker'
import { useStore } from '@/lib/store'
import { dayKey, sumMacros, round } from '@/lib/helpers'

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string
  value: number
  goal: number
  color: string
}) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  const over = goal > 0 && value > goal
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <span className="size-2.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="text-sm tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{round(value)}</span> / {round(goal)}g
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: over ? 'var(--destructive)' : color }}
        />
      </div>
    </div>
  )
}

export function Dashboard({
  onScan,
  onAdd,
  onTrends,
}: {
  onScan: () => void
  onAdd: () => void
  onTrends: () => void
}) {
  const { data } = useStore()
  const { profile } = data

  const today = useMemo(() => {
    const meals = data.meals.filter((m) => dayKey(m.timestamp) === dayKey())
    const totals = sumMacros(meals)
    const scores = meals.filter((m) => typeof m.health_score === 'number')
    const avgScore = scores.length
      ? scores.reduce((a, m) => a + (m.health_score || 0), 0) / scores.length
      : null
    return { meals, totals, avgScore }
  }, [data.meals])

  const remaining = Math.max(0, profile.calorieGoal - today.totals.calories)
  const eaten = Math.round(today.totals.calories)

  return (
    <div className="flex flex-col gap-4">
      {/* Hero calorie card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:gap-8">
          <ProgressRing
            value={today.totals.calories}
            max={profile.calorieGoal}
            size={168}
            stroke={14}
            color="var(--calories)"
          >
            <Flame className="mb-1 size-5 text-calories" />
            <span className="text-3xl font-bold tabular-nums leading-none">{eaten}</span>
            <span className="mt-1 text-xs text-muted-foreground">of {profile.calorieGoal} kcal</span>
          </ProgressRing>

          <div className="flex w-full flex-1 flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Remaining
                </p>
                <p className="text-2xl font-bold tabular-nums text-calories">
                  {remaining}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kcal</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Consumed
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {eaten}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kcal</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onScan} className="w-full">
                <Camera className="size-4" />
                Scan meal
              </Button>
              <Button onClick={onAdd} variant="outline" className="w-full">
                <Plus className="size-4" />
                Quick add
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Macro rings */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Macronutrients</h2>
          <span className="text-xs text-muted-foreground">Daily targets</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Protein', value: today.totals.protein_g, goal: profile.proteinGoal, color: 'var(--protein)' },
            { label: 'Carbs', value: today.totals.carbs_g, goal: profile.carbsGoal, color: 'var(--carbs)' },
            { label: 'Fat', value: today.totals.fat_g, goal: profile.fatGoal, color: 'var(--fat)' },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <ProgressRing value={m.value} max={m.goal} size={84} stroke={9} color={m.color}>
                <span className="text-base font-bold tabular-nums leading-none">{round(m.value)}</span>
                <span className="text-[10px] text-muted-foreground">/{round(m.goal)}g</span>
              </ProgressRing>
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <MacroBar label="Protein" value={today.totals.protein_g} goal={profile.proteinGoal} color="var(--protein)" />
          <MacroBar label="Carbs" value={today.totals.carbs_g} goal={profile.carbsGoal} color="var(--carbs)" />
          <MacroBar label="Fat" value={today.totals.fat_g} goal={profile.fatGoal} color="var(--fat)" />
        </div>
      </Card>

      <WaterTracker />

      {/* Today at a glance */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-1 p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Utensils className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Meals today</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{today.meals.length}</p>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Avg health</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {today.avgScore !== null ? `${round(today.avgScore, 1)}` : '—'}
            {today.avgScore !== null && <span className="text-sm font-normal text-muted-foreground">/10</span>}
          </p>
        </Card>
      </div>

      <Button variant="ghost" onClick={onTrends} className="mx-auto">
        <TrendingUp className="size-4" />
        View weekly trends
      </Button>
    </div>
  )
}
