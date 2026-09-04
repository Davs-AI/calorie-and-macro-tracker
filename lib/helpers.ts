import type { MealEntry, MacroTotals } from './types'

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** local YYYY-MM-DD for a given date */
export function dayKey(d: Date | string = new Date()): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isSameDay(a: string, b: string): boolean {
  return dayKey(a) === dayKey(b)
}

export function sumMacros(meals: MealEntry[]): MacroTotals {
  return meals.reduce<MacroTotals>(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein_g: acc.protein_g + (m.protein_g || 0),
      carbs_g: acc.carbs_g + (m.carbs_g || 0),
      fat_g: acc.fat_g + (m.fat_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  )
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDateLabel(dateKey: string): string {
  const today = dayKey()
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const yesterday = dayKey(y)
  if (dateKey === today) return 'Today'
  if (dateKey === yesterday) return 'Yesterday'
  return new Date(dateKey + 'T00:00:00').toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** read a File as a base64 data URL */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** strip the `data:...;base64,` prefix */
export function dataUrlToBase64(dataUrl: string): { mimeType: string; data: string } {
  const [meta, data] = dataUrl.split(',')
  const mimeMatch = meta.match(/data:(.*?);base64/)
  return { mimeType: mimeMatch?.[1] || 'image/jpeg', data: data || '' }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function round(n: number, digits = 0): number {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

export function healthScoreColor(score: number): string {
  if (score >= 7) return 'text-success'
  if (score >= 4) return 'text-warning'
  return 'text-destructive'
}
