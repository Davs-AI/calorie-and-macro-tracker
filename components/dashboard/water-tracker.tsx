'use client'

import { Droplet, Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import { dayKey, clamp, round } from '@/lib/helpers'
import { mlToOz, ozToMl } from '@/lib/calc'

export function WaterTracker() {
  const { data, addWater } = useStore()
  const toast = useToast()
  const unit = data.settings.waterUnit
  const step = unit === 'oz' ? ozToMl(8) : 250

  const todayMl = data.water.find((w) => w.date === dayKey())?.ml ?? 0
  const goalMl = data.profile.waterGoalMl || 2500
  const pct = clamp(goalMl > 0 ? (todayMl / goalMl) * 100 : 0, 0, 100)

  const display = (ml: number) => (unit === 'oz' ? `${round(mlToOz(ml))} oz` : `${round(ml)} ml`)

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-water/15 text-water">
            <Droplet className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Water</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {display(todayMl)} of {display(goalMl)}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold tabular-nums text-water">{Math.round(pct)}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-water transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            if (todayMl <= 0) return
            addWater(-step)
          }}
          aria-label="Remove water"
        >
          <Minus className="size-4" />
        </Button>
        <Button
          size="lg"
          className="flex-[2] bg-water text-primary-foreground hover:bg-water/90"
          onClick={() => {
            addWater(step)
            toast.success('Water logged', `+${unit === 'oz' ? '8 oz' : '250 ml'}`)
          }}
        >
          <Plus className="size-4" />
          Add {unit === 'oz' ? '8 oz' : '250 ml'}
        </Button>
      </div>
    </Card>
  )
}
