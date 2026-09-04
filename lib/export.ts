import type { AppData, MealEntry } from './types'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const stamp = () => new Date().toISOString().slice(0, 10)

export function exportJson(data: AppData) {
  // strip images to keep the file lean
  const lean: AppData = {
    ...data,
    meals: data.meals.map(({ image, ...m }) => m),
  }
  download(`nutrilens-backup-${stamp()}.json`, JSON.stringify(lean, null, 2), 'application/json')
}

function csvEscape(v: unknown): string {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportCsv(meals: MealEntry[]) {
  const headers = [
    'timestamp',
    'name',
    'category',
    'calories',
    'protein_g',
    'carbs_g',
    'fat_g',
    'health_score',
    'confidence',
    'ingredients',
    'note',
  ]
  const rows = meals.map((m) =>
    [
      m.timestamp,
      m.name,
      m.category,
      m.calories,
      m.protein_g,
      m.carbs_g,
      m.fat_g,
      m.health_score ?? '',
      m.confidence ?? '',
      (m.ingredients ?? []).join('; '),
      m.note ?? '',
    ]
      .map(csvEscape)
      .join(','),
  )
  download(`nutrilens-meals-${stamp()}.csv`, [headers.join(','), ...rows].join('\n'), 'text/csv')
}

export function parseImport(text: string): AppData {
  const parsed = JSON.parse(text)
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.meals)) {
    throw new Error('Invalid backup file — missing expected fields.')
  }
  return parsed as AppData
}
