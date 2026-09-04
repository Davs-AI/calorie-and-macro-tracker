'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Plus, Scale, TrendingUp } from 'lucide-react'
import { Card, Input, Label, Segmented } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import { dayKey, sumMacros, round } from '@/lib/helpers'
import { kgToLb, lbToKg } from '@/lib/calc'

type Range = '7' | '30'

function StatTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="tabular-nums" style={{ color: p.color || p.stroke || p.fill }}>
          {p.name}: {round(p.value)}
        </p>
      ))}
    </div>
  )
}

export function Trends() {
  const { data } = useStore()
  const [range, setRange] = useState<Range>('7')

  const days = Number(range)

  const series = useMemo(() => {
    const out: { key: string; label: string; calories: number; protein: number; carbs: number; fat: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = dayKey(d)
      const meals = data.meals.filter((m) => dayKey(m.timestamp) === key)
      const t = sumMacros(meals)
      out.push({
        key,
        label: d.toLocaleDateString([], days > 7 ? { day: 'numeric' } : { weekday: 'short' }),
        calories: Math.round(t.calories),
        protein: Math.round(t.protein_g),
        carbs: Math.round(t.carbs_g),
        fat: Math.round(t.fat_g),
      })
    }
    return out
  }, [data.meals, days])

  const averages = useMemo(() => {
    const active = series.filter((s) => s.calories > 0)
    const n = active.length || 1
    const sum = active.reduce(
      (a, s) => ({
        calories: a.calories + s.calories,
        protein: a.protein + s.protein,
        carbs: a.carbs + s.carbs,
        fat: a.fat + s.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
    return {
      calories: Math.round(sum.calories / n),
      protein: Math.round(sum.protein / n),
      carbs: Math.round(sum.carbs / n),
      fat: Math.round(sum.fat / n),
      loggedDays: active.length,
    }
  }, [series])

  const goal = data.profile.calorieGoal

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        value={range}
        onChange={setRange}
        options={[
          { value: '7', label: 'Last 7 days' },
          { value: '30', label: 'Last 30 days' },
        ]}
      />

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-calories" />
          <h2 className="text-sm font-semibold">Daily averages</h2>
          <span className="ml-auto text-xs text-muted-foreground">{averages.loggedDays} logged days</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Calories" value={String(averages.calories)} unit="kcal" />
          <StatTile label="Protein" value={String(averages.protein)} unit="g" />
          <StatTile label="Carbs" value={String(averages.carbs)} unit="g" />
          <StatTile label="Fat" value={String(averages.fat)} unit="g" />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold">Calories vs. goal</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                interval={days > 7 ? 3 : 0}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
              <ReferenceLine y={goal} stroke="var(--calories)" strokeDasharray="4 4" />
              <Bar dataKey="calories" name="Calories" fill="var(--calories)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Dashed line = your {goal} kcal goal
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold">Protein trend</h2>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                interval={days > 7 ? 3 : 0}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={data.profile.proteinGoal} stroke="var(--protein)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="protein"
                name="Protein"
                stroke="var(--protein)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--protein)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <WeightSection />
    </div>
  )
}

function WeightSection() {
  const { data, addWeight, deleteWeight } = useStore()
  const toast = useToast()
  const unit = data.settings.weightUnit
  const [input, setInput] = useState('')

  const chartData = useMemo(() => {
    return [...data.weights]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((w) => ({
        key: w.date,
        label: new Date(w.date + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' }),
        weight: round(unit === 'lb' ? kgToLb(w.kg) : w.kg, 1),
        id: w.id,
      }))
  }, [data.weights, unit])

  const log = () => {
    const v = Number(input)
    if (!v || v <= 0) {
      toast.error('Enter a valid weight')
      return
    }
    const kg = unit === 'lb' ? lbToKg(v) : v
    addWeight(round(kg, 2))
    toast.success('Weight logged', `${v} ${unit} for today`)
    setInput('')
  }

  const latest = chartData[chartData.length - 1]
  const first = chartData[0]
  const delta = latest && first ? round(latest.weight - first.weight, 1) : 0

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Scale className="size-4 text-calories" />
        <h2 className="text-sm font-semibold">Weight log</h2>
        {chartData.length > 1 && (
          <span
            className={`ml-auto text-xs font-medium tabular-nums ${
              delta < 0 ? 'text-success' : delta > 0 ? 'text-warning' : 'text-muted-foreground'
            }`}
          >
            {delta > 0 ? '+' : ''}
            {delta} {unit} overall
          </span>
        )}
      </div>

      <div className="mb-4 flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="weight-input">Today&apos;s weight ({unit})</Label>
          <Input
            id="weight-input"
            type="number"
            inputMode="decimal"
            min={0}
            value={input}
            placeholder={unit === 'lb' ? '165' : '75'}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                log()
              }
            }}
          />
        </div>
        <Button onClick={log} className="shrink-0">
          <Plus className="size-4" />
          Log
        </Button>
      </div>

      {chartData.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Log your weight to track progress over time.
        </p>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                name={`Weight (${unit})`}
                stroke="var(--calories)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--calories)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...chartData].reverse().slice(0, 8).map((w) => (
            <button
              key={w.id}
              onClick={() => {
                deleteWeight(w.id)
                toast.success('Weight entry removed')
              }}
              className="group flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
              title="Click to delete"
            >
              {w.label}: {w.weight}
              {unit}
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
