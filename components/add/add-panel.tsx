'use client'

import { useMemo, useState } from 'react'
import { Check, Plus, Search, Star, Wand2, Trash2 } from 'lucide-react'
import { Card, Input, Label, Segmented, Badge } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { MealForm, useMealForm } from '@/components/meal-form'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import { COMMON_FOODS, parseQuickText } from '@/lib/common-foods'
import type { FavoriteFood, MealCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

export function AddPanel() {
  const [tab, setTab] = useState<'quick' | 'search'>('quick')
  return (
    <div className="flex flex-col gap-4">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'quick', label: 'Quick Add' },
          { value: 'search', label: 'Search & Favorites' },
        ]}
      />
      {tab === 'quick' ? <QuickAdd /> : <SearchFavorites />}
    </div>
  )
}

function QuickAdd() {
  const { addMeal, addFavorite } = useStore()
  const toast = useToast()
  const { values, setValues } = useMealForm()
  const [quickText, setQuickText] = useState('')
  const [saveFav, setSaveFav] = useState(false)

  const applyParse = () => {
    if (!quickText.trim()) return
    const parsed = parseQuickText(quickText)
    setValues((prev) => ({ ...prev, ...parsed }))
    toast.info('Parsed', 'Review the fields below and adjust if needed.')
  }

  const log = () => {
    if (!values.name.trim()) {
      toast.error('Meal name required')
      return
    }
    addMeal({
      name: values.name.trim(),
      category: values.category,
      calories: values.calories,
      protein_g: values.protein_g,
      carbs_g: values.carbs_g,
      fat_g: values.fat_g,
      note: values.note,
    })
    if (saveFav) {
      addFavorite({
        name: values.name.trim(),
        calories: values.calories,
        protein_g: values.protein_g,
        carbs_g: values.carbs_g,
        fat_g: values.fat_g,
      })
    }
    toast.success('Meal logged', `${values.calories} kcal added to ${values.category}`)
    setValues((prev) => ({ ...prev, name: '', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, note: '' }))
    setQuickText('')
    setSaveFav(false)
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div>
        <Label htmlFor="quick-text">Smart entry</Label>
        <div className="flex gap-2">
          <Input
            id="quick-text"
            value={quickText}
            placeholder="Protein Bar - 200 kcal, 20g protein"
            onChange={(e) => setQuickText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                applyParse()
              }
            }}
          />
          <Button variant="secondary" onClick={applyParse} className="shrink-0">
            <Wand2 className="size-4" />
            Parse
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Type freely and we&apos;ll extract calories and macros, or fill the form manually.
        </p>
      </div>

      <div className="h-px bg-border" />

      <MealForm values={values} setValues={setValues} />

      <button
        type="button"
        onClick={() => setSaveFav((s) => !s)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-md border',
            saveFav ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
          )}
        >
          {saveFav && <Check className="size-3.5" />}
        </span>
        <Star className={cn('size-4', saveFav && 'fill-warning text-warning')} />
        Save as a favorite food
      </button>

      <Button size="lg" onClick={log}>
        <Plus className="size-4" />
        Log meal
      </Button>
    </Card>
  )
}

function defaultCategory(): MealCategory {
  const h = new Date().getHours()
  if (h < 11) return 'Breakfast'
  if (h < 15) return 'Lunch'
  if (h < 21) return 'Dinner'
  return 'Snacks'
}

function SearchFavorites() {
  const { data, addMeal, addFavorite, deleteFavorite } = useStore()
  const toast = useToast()
  const [query, setQuery] = useState('')

  const savedIds = useMemo(() => data.favorites, [data.favorites])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 12)
  }, [query])

  const quickLog = (food: Omit<FavoriteFood, 'id'>) => {
    addMeal({
      name: food.name,
      category: defaultCategory(),
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
    })
    toast.success('Logged', `${food.name} · ${food.calories} kcal`)
  }

  const FoodRow = ({
    food,
    onStar,
    starred,
    onRemove,
  }: {
    food: Omit<FavoriteFood, 'id'>
    onStar?: () => void
    starred?: boolean
    onRemove?: () => void
  }) => (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{food.name}</p>
        <p className="text-xs text-muted-foreground">
          {food.calories} kcal · P {food.protein_g}g · C {food.carbs_g}g · F {food.fat_g}g
        </p>
      </div>
      {onStar && (
        <button
          onClick={onStar}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-warning"
          aria-label={starred ? 'Saved to favorites' : 'Save to favorites'}
        >
          <Star className={cn('size-4', starred && 'fill-warning text-warning')} />
        </button>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Remove favorite"
        >
          <Trash2 className="size-4" />
        </button>
      )}
      <Button size="sm" onClick={() => quickLog(food)}>
        <Plus className="size-4" />
        Log
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <Label htmlFor="food-search">Search common foods</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="food-search"
            value={query}
            placeholder="Search foods… (e.g. chicken, banana)"
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {query.trim() && (
          <div className="mt-3 flex flex-col gap-2">
            {results.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No matches. Try the Quick Add tab to enter it manually.
              </p>
            ) : (
              results.map((f) => {
                const starred = savedIds.some((s) => s.name === f.name)
                return (
                  <FoodRow
                    key={f.name}
                    food={f}
                    starred={starred}
                    onStar={() => {
                      if (starred) return
                      addFavorite(f)
                      toast.success('Saved to favorites', f.name)
                    }}
                  />
                )
              })
            )}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Star className="size-4 text-warning" />
          <h3 className="text-sm font-semibold">Favorite foods</h3>
          <Badge className="ml-auto">{data.favorites.length}</Badge>
        </div>
        {data.favorites.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No favorites yet. Star foods from search or save them when logging a meal for 1-click access.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.favorites.map((f) => (
              <FoodRow key={f.id} food={f} onRemove={() => deleteFavorite(f.id)} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
