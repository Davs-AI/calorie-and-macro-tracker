'use client'

import { useState } from 'react'
import { Calculator, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Modal, Input, Label, Select, Segmented } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  calculateMacros,
  kgToLb,
  lbToKg,
} from '@/lib/calc'
import type { ActivityLevel, FitnessGoal, Sex } from '@/lib/types'

export function MacroWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, updateProfile } = useStore()
  const toast = useToast()
  const weightUnit = data.settings.weightUnit

  const [step, setStep] = useState(0)
  const [weight, setWeight] = useState(() =>
    data.profile.weightKg
      ? String(Math.round(weightUnit === 'lb' ? kgToLb(data.profile.weightKg) : data.profile.weightKg))
      : '',
  )
  const [heightCm, setHeightCm] = useState(data.profile.heightCm ? String(data.profile.heightCm) : '')
  const [age, setAge] = useState(data.profile.age ? String(data.profile.age) : '')
  const [sex, setSex] = useState<Sex>(data.profile.sex ?? 'male')
  const [activity, setActivity] = useState<ActivityLevel>(data.profile.activity ?? 'moderate')
  const [goal, setGoal] = useState<FitnessGoal>(data.profile.goal ?? 'maintain')

  const weightKg = weightUnit === 'lb' ? lbToKg(Number(weight)) : Number(weight)
  const valid = Number(weight) > 0 && Number(heightCm) > 0 && Number(age) > 0

  const result =
    valid && step === 2
      ? calculateMacros({
          weightKg,
          heightCm: Number(heightCm),
          age: Number(age),
          sex,
          activity,
          goal,
        })
      : null

  const apply = () => {
    if (!result) return
    updateProfile({
      calorieGoal: result.calorieGoal,
      proteinGoal: result.proteinGoal,
      carbsGoal: result.carbsGoal,
      fatGoal: result.fatGoal,
      weightKg: Math.round(weightKg * 100) / 100,
      heightCm: Number(heightCm),
      age: Number(age),
      sex,
      activity,
      goal,
    })
    toast.success('Goals updated', `${result.calorieGoal} kcal daily target set`)
    onClose()
    setStep(0)
  }

  const close = () => {
    onClose()
    setStep(0)
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Macro calculator"
      description="Estimate your daily targets from your stats and goal."
    >
      {/* step indicator */}
      <div className="mb-5 flex items-center gap-1.5">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="w-weight">Weight ({weightUnit})</Label>
              <Input
                id="w-weight"
                type="number"
                inputMode="decimal"
                value={weight}
                placeholder={weightUnit === 'lb' ? '165' : '75'}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="w-height">Height (cm)</Label>
              <Input
                id="w-height"
                type="number"
                inputMode="decimal"
                value={heightCm}
                placeholder="175"
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="w-age">Age</Label>
              <Input
                id="w-age"
                type="number"
                inputMode="numeric"
                value={age}
                placeholder="30"
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div>
              <Label>Biological sex</Label>
              <Segmented
                value={sex}
                onChange={setSex}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                className="flex w-full"
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="w-activity">Activity level</Label>
            <Select
              id="w-activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            >
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((k) => (
                <option key={k} value={k}>
                  {ACTIVITY_LABELS[k]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Fitness goal</Label>
            <div className="grid gap-2">
              {(Object.keys(GOAL_LABELS) as FitnessGoal[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setGoal(k)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    goal === k
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {GOAL_LABELS[k]}
                  {goal === k && <Check className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Estimated daily calories
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-calories">{result.calorieGoal}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              BMR {result.bmr} · TDEE {result.tdee} kcal
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Protein', value: result.proteinGoal, color: 'var(--protein)' },
              { label: 'Carbs', value: result.carbsGoal, color: 'var(--carbs)' },
              { label: 'Fat', value: result.fatGoal, color: 'var(--fat)' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border p-3 text-center">
                <span className="mx-auto mb-1 block size-2.5 rounded-full" style={{ background: m.color }} />
                <p className="text-lg font-bold tabular-nums">{m.value}g</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            You can fine-tune these anytime in Daily Goals.
          </p>
        </div>
      )}

      {step === 2 && !result && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Please complete the earlier steps with valid numbers.
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-2">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="size-4" />
            Back
          </Button>
        ) : (
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
        )}

        {step < 2 ? (
          <Button
            onClick={() => {
              if (step === 0 && !valid) {
                toast.error('Fill in weight, height, and age')
                return
              }
              setStep((s) => s + 1)
            }}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={apply} disabled={!result}>
            <Calculator className="size-4" />
            Apply goals
          </Button>
        )}
      </div>
    </Modal>
  )
}
