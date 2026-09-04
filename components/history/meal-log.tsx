'use client'

import { useMemo, useState } from 'react'
import { Search, Pencil, Trash2, Utensils } from 'lucide-react'
import { Card, Input, Badge, Modal } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { MealForm, useMealForm } from '@/components/meal-form'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import {
  dayKey,
  formatDateLabel,
  formatTime,
  healthScoreColor,
  sumMacros,
} from '@/lib/helpers'
import { MEAL_CATEGORIES, type MealEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

export function MealLog() {
  const { data, deleteMeal } = useStore()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<MealEntry | null>(null)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = data.meals.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.ingredients?.some((i) => i.toLowerCase().includes(q)),
    )
    const byDay = new Map<string, MealEntry[]>()
    for (const m of filtered) {
      const k = dayKey(m.timestamp)
      if (!byDay.has(k)) byDay.set(k, [])
      byDay.get(k)!.push(m)
    }
    return Array.from(byDay.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [data.meals, query])

  if (data.meals.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Utensils className="size-6" />
        </div>
        <div>
          <p className="font-medium">No meals logged yet</p>
          <p className="text-sm text-muted-foreground">Scan or quick-add a meal to see it here.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          placeholder="Search meals or ingredients…"
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {groups.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No meals match your search.</p>
      )}

      {groups.map(([day, meals]) => {
        const totals = sumMacros(meals)
        return (
          <div key={day} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-semibold">{formatDateLabel(day)}</h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {Math.round(totals.calories)} kcal · P {Math.round(totals.protein_g)} · C{' '}
                {Math.round(totals.carbs_g)} · F {Math.round(totals.fat_g)}
              </span>
            </div>

            {MEAL_CATEGORIES.map((cat) => {
              const catMeals = meals.filter((m) => m.category === cat)
              if (catMeals.length === 0) return null
              return (
                <div key={cat} className="flex flex-col gap-2">
                  <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {cat}
                  </p>
                  {catMeals.map((m) => (
                    <MealCard
                      key={m.id}
                      meal={m}
                      onEdit={() => setEditing(m)}
                      onDelete={() => {
                        deleteMeal(m.id)
                        toast.success('Meal deleted')
                      }}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}

      <EditMealModal meal={editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function MealCard({
  meal,
  onEdit,
  onDelete,
}: {
  meal: MealEntry
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card className="flex gap-3 p-3">
      {meal.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={meal.image || '/placeholder.svg'}
          alt={meal.name}
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Utensils className="size-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{meal.name}</p>
            <p className="text-xs text-muted-foreground">{formatTime(meal.timestamp)}</p>
          </div>
          <div className="flex shrink-0 gap-0.5">
            <button
              onClick={onEdit}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Edit ${meal.name}`}
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${meal.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums text-calories">
            {Math.round(meal.calories)} kcal
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            P {Math.round(meal.protein_g)}g · C {Math.round(meal.carbs_g)}g · F{' '}
            {Math.round(meal.fat_g)}g
          </span>
          {typeof meal.health_score === 'number' && (
            <Badge className="ml-auto bg-muted font-normal">
              <span className={cn('font-bold', healthScoreColor(meal.health_score))}>
                {meal.health_score}/10
              </span>
            </Badge>
          )}
        </div>

        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {meal.ingredients.slice(0, 5).map((ing, i) => (
              <span
                key={i}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
              >
                {ing}
              </span>
            ))}
          </div>
        )}
        {meal.note && <p className="mt-1.5 text-xs italic text-muted-foreground">“{meal.note}”</p>}
      </div>
    </Card>
  )
}

function EditMealModal({ meal, onClose }: { meal: MealEntry | null; onClose: () => void }) {
  return (
    <Modal open={!!meal} onClose={onClose} title="Edit meal" description="Changes update your daily totals.">
      {meal && <EditBody meal={meal} onClose={onClose} />}
    </Modal>
  )
}

function EditBody({ meal, onClose }: { meal: MealEntry; onClose: () => void }) {
  const { updateMeal } = useStore()
  const toast = useToast()
  const { values, setValues } = useMealForm({
    name: meal.name,
    category: meal.category,
    calories: meal.calories,
    protein_g: meal.protein_g,
    carbs_g: meal.carbs_g,
    fat_g: meal.fat_g,
    note: meal.note,
  })

  const save = () => {
    if (!values.name.trim()) {
      toast.error('Meal name required')
      return
    }
    updateMeal(meal.id, {
      name: values.name.trim(),
      category: values.category,
      calories: values.calories,
      protein_g: values.protein_g,
      carbs_g: values.carbs_g,
      fat_g: values.fat_g,
      note: values.note,
    })
    toast.success('Meal updated')
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <MealForm values={values} setValues={setValues} />
      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={save}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
