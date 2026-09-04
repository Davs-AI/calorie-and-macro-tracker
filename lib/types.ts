export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

export const MEAL_CATEGORIES: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

export type ConfidenceRating = 'High' | 'Medium' | 'Low'

export type WaterUnit = 'oz' | 'ml'
export type WeightUnit = 'lb' | 'kg'

export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type FitnessGoal = 'lose' | 'maintain' | 'gain'

/** AI response schema returned by Gemini */
export interface FoodAnalysis {
  meal_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  health_score: number
  ingredients_detected: string[]
  confidence_rating: ConfidenceRating
}

export interface MealEntry {
  id: string
  name: string
  category: MealCategory
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  health_score?: number
  ingredients?: string[]
  confidence?: ConfidenceRating
  note?: string
  image?: string // base64 data url thumbnail
  /** ISO timestamp */
  timestamp: string
}

export interface FavoriteFood {
  id: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface WaterLog {
  /** YYYY-MM-DD */
  date: string
  /** amount in ml (stored canonical) */
  ml: number
}

export interface WeightLog {
  id: string
  /** YYYY-MM-DD */
  date: string
  /** weight in kg (canonical) */
  kg: number
}

export interface Profile {
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
  /** water goal in ml (canonical) */
  waterGoalMl: number
  // wizard inputs
  weightKg?: number
  heightCm?: number
  age?: number
  sex?: Sex
  activity?: ActivityLevel
  goal?: FitnessGoal
}

export interface Settings {
  apiKey: string
  waterUnit: WaterUnit
  weightUnit: WeightUnit
  theme: 'light' | 'dark'
}

export interface AppData {
  profile: Profile
  settings: Settings
  meals: MealEntry[]
  favorites: FavoriteFood[]
  water: WaterLog[]
  weights: WeightLog[]
}

export interface MacroTotals {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}
