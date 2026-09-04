'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  AppData,
  FavoriteFood,
  MealEntry,
  Profile,
  Settings,
  WeightLog,
} from './types'
import { dayKey, uid } from './helpers'

const STORAGE_KEY = 'nutrilens.data.v1'
const THEME_KEY = 'nutrilens.theme'

const defaultProfile: Profile = {
  calorieGoal: 2000,
  proteinGoal: 150,
  carbsGoal: 200,
  fatGoal: 65,
  waterGoalMl: 2500,
}

const defaultSettings: Settings = {
  apiKey: '',
  waterUnit: 'oz',
  weightUnit: 'lb',
  theme: 'light',
}

function defaultData(): AppData {
  return {
    profile: { ...defaultProfile },
    settings: { ...defaultSettings },
    meals: [],
    favorites: [],
    water: [],
    weights: [],
  }
}

interface StoreContextValue {
  data: AppData
  hydrated: boolean
  // meals
  addMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'> & Partial<Pick<MealEntry, 'timestamp'>>) => void
  updateMeal: (id: string, patch: Partial<MealEntry>) => void
  deleteMeal: (id: string) => void
  // favorites
  addFavorite: (fav: Omit<FavoriteFood, 'id'>) => void
  deleteFavorite: (id: string) => void
  // water
  addWater: (ml: number, date?: string) => void
  setWater: (ml: number, date?: string) => void
  // weight
  addWeight: (kg: number, date?: string) => void
  deleteWeight: (id: string) => void
  // profile & settings
  updateProfile: (patch: Partial<Profile>) => void
  updateSettings: (patch: Partial<Settings>) => void
  // theme
  theme: 'light' | 'dark'
  toggleTheme: () => void
  // data
  importData: (raw: AppData) => void
  clearAll: () => void
  replaceData: (d: AppData) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData)
  const [hydrated, setHydrated] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const firstLoad = useRef(true)

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppData
        setData({
          profile: { ...defaultProfile, ...parsed.profile },
          settings: { ...defaultSettings, ...parsed.settings },
          meals: parsed.meals ?? [],
          favorites: parsed.favorites ?? [],
          water: parsed.water ?? [],
          weights: parsed.weights ?? [],
        })
      }
      const storedTheme = localStorage.getItem(THEME_KEY)
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      const resolved = (storedTheme as 'light' | 'dark') || (prefersDark ? 'dark' : 'light')
      setTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    } catch {
      /* ignore corrupt data */
    }
    setHydrated(true)
  }, [])

  // persist data
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* storage full / unavailable */
    }
  }, [data, hydrated])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const addMeal = useCallback<StoreContextValue['addMeal']>((meal) => {
    setData((d) => ({
      ...d,
      meals: [
        { ...meal, id: uid(), timestamp: meal.timestamp ?? new Date().toISOString() },
        ...d.meals,
      ],
    }))
  }, [])

  const updateMeal = useCallback<StoreContextValue['updateMeal']>((id, patch) => {
    setData((d) => ({
      ...d,
      meals: d.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [])

  const deleteMeal = useCallback((id: string) => {
    setData((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }))
  }, [])

  const addFavorite = useCallback<StoreContextValue['addFavorite']>((fav) => {
    setData((d) => ({ ...d, favorites: [{ ...fav, id: uid() }, ...d.favorites] }))
  }, [])

  const deleteFavorite = useCallback((id: string) => {
    setData((d) => ({ ...d, favorites: d.favorites.filter((f) => f.id !== id) }))
  }, [])

  const addWater = useCallback((ml: number, date?: string) => {
    const key = date ?? dayKey()
    setData((d) => {
      const existing = d.water.find((w) => w.date === key)
      const next = Math.max(0, (existing?.ml ?? 0) + ml)
      return {
        ...d,
        water: existing
          ? d.water.map((w) => (w.date === key ? { ...w, ml: next } : w))
          : [...d.water, { date: key, ml: next }],
      }
    })
  }, [])

  const setWater = useCallback((ml: number, date?: string) => {
    const key = date ?? dayKey()
    setData((d) => {
      const existing = d.water.find((w) => w.date === key)
      return {
        ...d,
        water: existing
          ? d.water.map((w) => (w.date === key ? { ...w, ml: Math.max(0, ml) } : w))
          : [...d.water, { date: key, ml: Math.max(0, ml) }],
      }
    })
  }, [])

  const addWeight = useCallback((kg: number, date?: string) => {
    const key = date ?? dayKey()
    setData((d) => {
      const existing = d.weights.find((w) => w.date === key)
      const entry: WeightLog = { id: existing?.id ?? uid(), date: key, kg }
      return {
        ...d,
        weights: existing
          ? d.weights.map((w) => (w.date === key ? entry : w))
          : [...d.weights, entry],
      }
    })
  }, [])

  const deleteWeight = useCallback((id: string) => {
    setData((d) => ({ ...d, weights: d.weights.filter((w) => w.id !== id) }))
  }, [])

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  const replaceData = useCallback((d: AppData) => setData(d), [])

  const importData = useCallback((raw: AppData) => {
    setData({
      profile: { ...defaultProfile, ...raw.profile },
      settings: { ...defaultSettings, ...raw.settings },
      meals: raw.meals ?? [],
      favorites: raw.favorites ?? [],
      water: raw.water ?? [],
      weights: raw.weights ?? [],
    })
  }, [])

  const clearAll = useCallback(() => {
    setData((d) => ({ ...defaultData(), settings: d.settings }))
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      data,
      hydrated,
      addMeal,
      updateMeal,
      deleteMeal,
      addFavorite,
      deleteFavorite,
      addWater,
      setWater,
      addWeight,
      deleteWeight,
      updateProfile,
      updateSettings,
      theme,
      toggleTheme,
      importData,
      clearAll,
      replaceData,
    }),
    [
      data,
      hydrated,
      addMeal,
      updateMeal,
      deleteMeal,
      addFavorite,
      deleteFavorite,
      addWater,
      setWater,
      addWeight,
      deleteWeight,
      updateProfile,
      updateSettings,
      theme,
      toggleTheme,
      importData,
      clearAll,
      replaceData,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
