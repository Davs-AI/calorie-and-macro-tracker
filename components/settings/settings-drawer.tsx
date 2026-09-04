'use client'

import { useRef, useState } from 'react'
import {
  X,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Wifi,
  Moon,
  Sun,
  Download,
  Upload,
  Calculator,
  Database,
  Loader2,
  CheckCircle2,
  Target,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import { Card, Input, Label, Select, Segmented } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { testApiKey } from '@/lib/gemini'
import { MacroWizard } from '@/components/settings/macro-wizard'
import { exportJson, exportCsv, parseImport } from '@/lib/export'
import { mlToOz, ozToMl } from '@/lib/calc'
import { round } from '@/lib/helpers'
import type { WaterUnit, WeightUnit } from '@/lib/types'

export function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    data,
    updateSettings,
    updateProfile,
    theme,
    toggleTheme,
    importData,
    clearAll,
  } = useStore()
  const { settings, profile } = data
  const toast = useToast()

  const [showKey, setShowKey] = useState(false)
  const [keyDraft, setKeyDraft] = useState(settings.apiKey)
  const [testing, setTesting] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const waterUnit = settings.waterUnit
  // water goal shown in the user's preferred unit
  const waterGoalDisplay =
    waterUnit === 'oz' ? round(mlToOz(profile.waterGoalMl)) : round(profile.waterGoalMl)

  function saveKey() {
    updateSettings({ apiKey: keyDraft.trim() })
    toast.success('API key saved')
  }

  function clearKey() {
    setKeyDraft('')
    updateSettings({ apiKey: '' })
    toast.info('API key cleared')
  }

  async function handleTest() {
    if (!keyDraft.trim()) {
      toast.error('Enter an API key first')
      return
    }
    setTesting(true)
    try {
      await testApiKey(keyDraft.trim())
      toast.success('Connection successful')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setTesting(false)
    }
  }

  function setWaterGoal(displayValue: number) {
    const ml = waterUnit === 'oz' ? ozToMl(displayValue) : displayValue
    updateProfile({ waterGoalMl: Math.max(0, Math.round(ml)) })
  }

  function handleExportJson() {
    exportJson(data)
    toast.success('Exported JSON backup')
  }

  function handleExportCsv() {
    exportCsv(data.meals)
    toast.success('Exported CSV')
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = parseImport(text)
      importData(parsed)
      toast.success('Backup imported')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid backup file')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleClearAll() {
    if (confirm('Delete all logs, favorites, water, and weight history? Your API key and goals are kept.')) {
      clearAll()
      toast.info('All history cleared')
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card text-card-foreground shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Settings"
        aria-modal="true"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close settings"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Appearance */}
          <Card className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              {theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dark mode</span>
              <button
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === 'dark'}
                aria-label="Toggle dark mode"
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* API Key */}
          <Card className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Key className="size-4" />
              Google Gemini API Key
            </h3>
            <p className="text-xs text-muted-foreground">
              Stored locally in your browser. Used for AI food scanning with gemini-1.5-flash.
            </p>
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="AIza..."
                  className="pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={saveKey}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? <Loader2 className="size-4 animate-spin" /> : <Wifi className="size-4" />}
                Test
              </Button>
              <Button size="sm" variant="ghost" onClick={clearKey}>
                <Trash2 className="size-4" />
                Clear
              </Button>
            </div>
            {settings.apiKey && (
              <p className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 className="size-3.5" />
                Key is set
              </p>
            )}
          </Card>

          {/* Goals */}
          <Card className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Target className="size-4" />
                Daily Goals
              </h3>
              <Button size="sm" variant="outline" onClick={() => setWizardOpen(true)}>
                <Calculator className="size-4" />
                Calculate
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="g-cal">Calories (kcal)</Label>
                <Input
                  id="g-cal"
                  type="number"
                  value={profile.calorieGoal}
                  onChange={(e) => updateProfile({ calorieGoal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="g-pro">Protein (g)</Label>
                <Input
                  id="g-pro"
                  type="number"
                  value={profile.proteinGoal}
                  onChange={(e) => updateProfile({ proteinGoal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="g-carb">Carbs (g)</Label>
                <Input
                  id="g-carb"
                  type="number"
                  value={profile.carbsGoal}
                  onChange={(e) => updateProfile({ carbsGoal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="g-fat">Fat (g)</Label>
                <Input
                  id="g-fat"
                  type="number"
                  value={profile.fatGoal}
                  onChange={(e) => updateProfile({ fatGoal: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="g-water">Water Goal ({waterUnit})</Label>
              <Input
                id="g-water"
                type="number"
                value={waterGoalDisplay}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
              />
            </div>
          </Card>

          {/* Units */}
          <Card className="space-y-3 p-4">
            <h3 className="text-sm font-semibold">Units</h3>
            <div>
              <Label>Water</Label>
              <Segmented
                value={waterUnit}
                onChange={(v) => updateSettings({ waterUnit: v as WaterUnit })}
                className="flex w-full"
                options={[
                  { value: 'oz', label: 'Ounces (oz)' },
                  { value: 'ml', label: 'Milliliters (ml)' },
                ]}
              />
            </div>
            <div>
              <Label>Weight</Label>
              <Segmented
                value={settings.weightUnit}
                onChange={(v) => updateSettings({ weightUnit: v as WeightUnit })}
                className="flex w-full"
                options={[
                  { value: 'lb', label: 'Pounds (lb)' },
                  { value: 'kg', label: 'Kilograms (kg)' },
                ]}
              />
            </div>
          </Card>

          {/* Data */}
          <Card className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Database className="size-4" />
              Data Backup
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleExportJson}>
                <Download className="size-4" />
                Export JSON
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportCsv}>
                <Download className="size-4" />
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" />
                Import
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleClearAll}>
              <Trash2 className="size-4" />
              Clear all history
            </Button>
          </Card>
        </div>
      </aside>

      <MacroWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  )
}
