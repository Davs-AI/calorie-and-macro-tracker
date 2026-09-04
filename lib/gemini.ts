import type { FoodAnalysis } from './types'
import { dataUrlToBase64 } from './helpers'

const MODEL = 'gemini-3.6-flash'
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    meal_name: { type: 'STRING' },
    calories: { type: 'NUMBER' },
    protein_g: { type: 'NUMBER' },
    carbs_g: { type: 'NUMBER' },
    fat_g: { type: 'NUMBER' },
    health_score: { type: 'NUMBER' },
    ingredients_detected: { type: 'ARRAY', items: { type: 'STRING' } },
    confidence_rating: { type: 'STRING', enum: ['High', 'Medium', 'Low'] },
  },
  required: [
    'meal_name',
    'calories',
    'protein_g',
    'carbs_g',
    'fat_g',
    'health_score',
    'ingredients_detected',
    'confidence_rating',
  ],
}

const SYSTEM_PROMPT = `You are a nutrition estimation expert. Analyze the food in the image and estimate its nutritional content for the portion shown.
- meal_name: a concise descriptive name for the dish.
- calories: total estimated kilocalories for the visible portion.
- protein_g, carbs_g, fat_g: grams of each macronutrient.
- health_score: an integer 1-10 rating how healthy the meal is (10 = very healthy).
- ingredients_detected: list the key ingredients you can identify.
- confidence_rating: your confidence in the estimate (High, Medium, or Low).
If a context note is provided, factor it into your estimate (e.g. cooking oil, portion size).`

export class GeminiError extends Error {}

export async function analyzeFoodImage(
  apiKey: string,
  imageDataUrl: string,
  note?: string,
): Promise<FoodAnalysis> {
  if (!apiKey) throw new GeminiError('No API key set. Add your Google Gemini API key in Settings.')

  const { mimeType, data } = dataUrlToBase64(imageDataUrl)
  if (!data) throw new GeminiError('Could not read the image data.')

  const promptText =
    SYSTEM_PROMPT + (note ? `\n\nUser context note: "${note}"` : '')

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: promptText },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  }

  let res: Response
  try {
    res = await fetch(ENDPOINT(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new GeminiError('Network error. Check your internet connection and try again.')
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status}).`
    try {
      const err = await res.json()
      if (err?.error?.message) msg = err.error.message
    } catch {
      /* ignore */
    }
    if (res.status === 400 || res.status === 403) {
      msg = 'Invalid or unauthorized API key. Double-check your Gemini key in Settings.'
    }
    throw new GeminiError(msg)
  }

  const json = await res.json()
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new GeminiError('The AI returned an empty response. Please try again.')

  let parsed: FoodAnalysis
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new GeminiError('The AI response was not valid JSON. Please retry.')
  }

  return normalize(parsed)
}

function normalize(p: Partial<FoodAnalysis>): FoodAnalysis {
  const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? Math.max(0, v) : 0)
  const conf = p.confidence_rating
  return {
    meal_name: p.meal_name?.toString().trim() || 'Unknown meal',
    calories: Math.round(num(p.calories)),
    protein_g: Math.round(num(p.protein_g)),
    carbs_g: Math.round(num(p.carbs_g)),
    fat_g: Math.round(num(p.fat_g)),
    health_score: Math.min(10, Math.max(0, Math.round(num(p.health_score)))),
    ingredients_detected: Array.isArray(p.ingredients_detected)
      ? p.ingredients_detected.map((i) => String(i)).slice(0, 20)
      : [],
    confidence_rating:
      conf === 'High' || conf === 'Medium' || conf === 'Low' ? conf : 'Medium',
  }
}

/** Lightweight connectivity/key test */
export async function testApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) throw new GeminiError('No API key provided.')
  const res = await fetch(ENDPOINT(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Reply with the single word: ok' }] }],
    }),
  }).catch(() => {
    throw new GeminiError('Network error while testing the key.')
  })

  if (!res.ok) {
    if (res.status === 400 || res.status === 403)
      throw new GeminiError('Invalid API key.')
    throw new GeminiError(`Test failed (${res.status}).`)
  }
  return true
}
