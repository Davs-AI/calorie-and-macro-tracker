'use client'

import { useState } from 'react'
import { Input, Label, Select, Textarea } from '@/components/ui/primitives'
import { MEAL_CATEGORIES, type MealCategory } from '@/lib/types'

export interface MealFormValues {
  name: string
  category: MealCategory
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  note?: string
}

function defaultCategory(): MealCategory {
  const h = new Date().getHours()
  if (h < 11) return 'Breakfast'
  if (h < 15) return 'Lunch'
  if (h < 21) return 'Dinner'
  return 'Snacks'
}

export function useMealForm(initial?: Partial<MealFormValues>) {
  const [values, setValues] = useState<MealFormValues>({
    name: initial?.name ?? '',
    category: initial?.category ?? defaultCategory(),
    calories: initial?.calories ?? 0,
    protein_g: initial?.protein_g ?? 0,
    carbs_g: initial?.carbs_g ?? 0,
    fat_g: initial?.fat_g ?? 0,
    note: initial?.note ?? '',
  })
  return { values, setValues }
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  accent,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  suffix: string
  accent?: string
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5">
        {accent && <span className="size-2 rounded-full" style={{ background: accent }} />}
        {label}
      </Label>
      <div className="relative">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="pr-10"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
    </div>
  )
}

export function MealForm({
  values,
  setValues,
  showNote = true,
  showCategory = true,
}: {
  values: MealFormValues
  setValues: React.Dispatch<React.SetStateAction<MealFormValues>>
  showNote?: boolean
  showCategory?: boolean
}) {
  const set = <K extends keyof MealFormValues>(k: K, v: MealFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="meal-name">Meal name</Label>
        <Input
          id="meal-name"
          value={values.name}
          placeholder="e.g. Grilled chicken salad"
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      {showCategory && (
        <div>
          <Label htmlFor="meal-cat">Category</Label>
          <Select
            id="meal-cat"
            value={values.category}
            onChange={(e) => set('category', e.target.value as MealCategory)}
          >
            {MEAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      )}

      <NumberField
        label="Calories"
        value={values.calories}
        suffix="kcal"
        accent="var(--calories)"
        onChange={(n) => set('calories', n)}
      />

      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label="Protein"
          value={values.protein_g}
          suffix="g"
          accent="var(--protein)"
          onChange={(n) => set('protein_g', n)}
        />
        <NumberField
          label="Carbs"
          value={values.carbs_g}
          suffix="g"
          accent="var(--carbs)"
          onChange={(n) => set('carbs_g', n)}
        />
        <NumberField
          label="Fat"
          value={values.fat_g}
          suffix="g"
          accent="var(--fat)"
          onChange={(n) => set('fat_g', n)}
        />
      </div>

      {showNote && (
        <div>
          <Label htmlFor="meal-note">Note (optional)</Label>
          <Textarea
            id="meal-note"
            value={values.note}
            placeholder="Any details worth remembering"
            onChange={(e) => set('note', e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
