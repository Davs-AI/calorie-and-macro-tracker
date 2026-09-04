'use client'

import { useState } from 'react'
import { Sparkles, Star, Check } from 'lucide-react'
import { Modal, Badge } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { MealForm, useMealForm } from '@/components/meal-form'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import type { FoodAnalysis } from '@/lib/types'
import { healthScoreColor } from '@/lib/helpers'
import { cn } from '@/lib/utils'

export interface ReviewPayload {
  analysis: FoodAnalysis
  image?: string
  note?: string
}

export function ReviewModal({
  payload,
  onClose,
}: {
  payload: ReviewPayload | null
  onClose: () => void
}) {
  const open = !!payload
  return (
    <Modal open={open} onClose={onClose} title="Review & log" description="Adjust anything the AI got wrong before saving.">
      {payload && <ReviewBody payload={payload} onClose={onClose} />}
    </Modal>
  )
}

function ReviewBody({ payload, onClose }: { payload: ReviewPayload; onClose: () => void }) {
  const { analysis, image, note } = payload
  const { addMeal, addFavorite } = useStore()
  const toast = useToast()
  const [saveFav, setSaveFav] = useState(false)
  const { values, setValues } = useMealForm({
    name: analysis.meal_name,
    calories: analysis.calories,
    protein_g: analysis.protein_g,
    carbs_g: analysis.carbs_g,
    fat_g: analysis.fat_g,
    note,
  })

  const confColor =
    analysis.confidence_rating === 'High'
      ? 'text-success'
      : analysis.confidence_rating === 'Medium'
        ? 'text-warning'
        : 'text-destructive'

  const handleLog = () => {
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
      image,
      health_score: analysis.health_score,
      ingredients: analysis.ingredients_detected,
      confidence: analysis.confidence_rating,
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
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image || '/placeholder.svg'}
          alt="Scanned meal"
          className="h-44 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="size-3" />
          AI estimate
        </Badge>
        <Badge>
          Health
          <span className={cn('font-bold', healthScoreColor(analysis.health_score))}>
            {analysis.health_score}/10
          </span>
        </Badge>
        <Badge>
          Confidence <span className={cn('font-bold', confColor)}>{analysis.confidence_rating}</span>
        </Badge>
      </div>

      {analysis.ingredients_detected.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Detected ingredients
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.ingredients_detected.map((ing, i) => (
              <Badge key={i} className="bg-muted font-normal">
                {ing}
              </Badge>
            ))}
          </div>
        </div>
      )}

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

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleLog}>
          Log meal
        </Button>
      </div>
    </div>
  )
}
