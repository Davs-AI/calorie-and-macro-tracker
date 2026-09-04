import type { FavoriteFood } from './types'

/** A small built-in food database used by the text search stub. */
export const COMMON_FOODS: Omit<FavoriteFood, 'id'>[] = [
  { name: 'Banana (medium)', calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0 },
  { name: 'Apple (medium)', calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0 },
  { name: 'Egg (large)', calories: 78, protein_g: 6, carbs_g: 1, fat_g: 5 },
  { name: 'Chicken breast (100g)', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 4 },
  { name: 'White rice (1 cup cooked)', calories: 205, protein_g: 4, carbs_g: 45, fat_g: 0 },
  { name: 'Brown rice (1 cup cooked)', calories: 216, protein_g: 5, carbs_g: 45, fat_g: 2 },
  { name: 'Oatmeal (1 cup cooked)', calories: 154, protein_g: 6, carbs_g: 27, fat_g: 3 },
  { name: 'Greek yogurt (170g)', calories: 100, protein_g: 17, carbs_g: 6, fat_g: 0 },
  { name: 'Almonds (28g)', calories: 164, protein_g: 6, carbs_g: 6, fat_g: 14 },
  { name: 'Peanut butter (2 tbsp)', calories: 188, protein_g: 8, carbs_g: 6, fat_g: 16 },
  { name: 'Whole wheat bread (slice)', calories: 82, protein_g: 4, carbs_g: 14, fat_g: 1 },
  { name: 'Avocado (half)', calories: 160, protein_g: 2, carbs_g: 9, fat_g: 15 },
  { name: 'Salmon (100g)', calories: 208, protein_g: 20, carbs_g: 0, fat_g: 13 },
  { name: 'Broccoli (1 cup)', calories: 55, protein_g: 4, carbs_g: 11, fat_g: 1 },
  { name: 'Sweet potato (medium)', calories: 112, protein_g: 2, carbs_g: 26, fat_g: 0 },
  { name: 'Protein shake (1 scoop)', calories: 120, protein_g: 24, carbs_g: 3, fat_g: 1 },
  { name: 'Protein bar', calories: 200, protein_g: 20, carbs_g: 22, fat_g: 7 },
  { name: 'Cheddar cheese (28g)', calories: 113, protein_g: 7, carbs_g: 0, fat_g: 9 },
  { name: 'Black coffee', calories: 2, protein_g: 0, carbs_g: 0, fat_g: 0 },
  { name: 'Orange juice (1 cup)', calories: 112, protein_g: 2, carbs_g: 26, fat_g: 0 },
  { name: 'Pasta (1 cup cooked)', calories: 221, protein_g: 8, carbs_g: 43, fat_g: 1 },
  { name: 'Ground beef 85% (100g)', calories: 250, protein_g: 26, carbs_g: 0, fat_g: 15 },
  { name: 'Tofu (100g)', calories: 76, protein_g: 8, carbs_g: 2, fat_g: 5 },
  { name: 'Mixed salad (2 cups)', calories: 20, protein_g: 2, carbs_g: 4, fat_g: 0 },
]

/**
 * Parse a freeform quick-add string like:
 *   "Protein Bar - 200 kcal, 20g Protein, 22g carbs, 7g fat"
 */
export function parseQuickText(text: string): {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
} {
  const t = text.trim()
  const num = (re: RegExp) => {
    const m = t.match(re)
    return m ? Math.max(0, Math.round(Number(m[1]))) : 0
  }
  const calories = num(/(\d+(?:\.\d+)?)\s*(?:kcal|cal|calories)/i)
  const protein_g = num(/(\d+(?:\.\d+)?)\s*g?\s*(?:protein|prot|p\b)/i)
  const carbs_g = num(/(\d+(?:\.\d+)?)\s*g?\s*(?:carbs|carb|c\b)/i)
  const fat_g = num(/(\d+(?:\.\d+)?)\s*g?\s*(?:fat|f\b)/i)

  // name = text before the first delimiter or number chunk
  let name = t.split(/[-–—,:]/)[0].trim()
  if (!name || /\d/.test(name)) {
    name = t.replace(/\d+(?:\.\d+)?\s*(?:kcal|cal|calories|g)?/gi, '').replace(/[-–—,:]/g, ' ').trim()
  }

  return { name: name || 'Quick meal', calories, protein_g, carbs_g, fat_g }
}
