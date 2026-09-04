import type { ActivityLevel, FitnessGoal, Sex } from './types'

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little/no exercise)',
  light: 'Light (1-3 days/week)',
  moderate: 'Moderate (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  very_active: 'Very active (hard daily training)',
}

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  lose: 'Weight Loss',
  maintain: 'Maintenance',
  gain: 'Muscle Gain',
}

export interface CalcInputs {
  weightKg: number
  heightCm: number
  age: number
  sex: Sex
  activity: ActivityLevel
  goal: FitnessGoal
}

export interface CalcResult {
  bmr: number
  tdee: number
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
}

/** Mifflin-St Jeor equation + goal-based macro split */
export function calculateMacros(input: CalcInputs): CalcResult {
  const { weightKg, heightCm, age, sex, activity, goal } = input

  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161)

  const tdee = bmr * ACTIVITY_FACTORS[activity]

  let calorieGoal = tdee
  if (goal === 'lose') calorieGoal = tdee - 500
  if (goal === 'gain') calorieGoal = tdee + 350
  calorieGoal = Math.max(1200, Math.round(calorieGoal))

  // Protein target scales with goal (g per kg bodyweight)
  const proteinPerKg = goal === 'gain' ? 2.0 : goal === 'lose' ? 1.8 : 1.6
  const proteinGoal = Math.round(weightKg * proteinPerKg)

  // Fat ~25% of calories
  const fatGoal = Math.round((calorieGoal * 0.25) / 9)

  // Carbs fill the rest
  const remaining = calorieGoal - proteinGoal * 4 - fatGoal * 9
  const carbsGoal = Math.max(0, Math.round(remaining / 4))

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
  }
}

// ----- unit helpers -----
export const ML_PER_OZ = 29.5735
export const KG_PER_LB = 0.453592

export const mlToOz = (ml: number) => ml / ML_PER_OZ
export const ozToMl = (oz: number) => oz * ML_PER_OZ
export const kgToLb = (kg: number) => kg / KG_PER_LB
export const lbToKg = (lb: number) => lb * KG_PER_LB
