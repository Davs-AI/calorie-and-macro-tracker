'use client'

import { useState } from 'react'
import { signUpWithEmail, signInWithEmail, continueAsGuest } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function SignInScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<'form' | 'guest' | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setLoading('form')

    const { data, error } =
      mode === 'signup'
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)

    if (error) {
      setErrorMsg(error.message)
      setLoading(null)
      return
    }

    if (data?.user) {
      router.push('/dashboard')
    } else if (mode === 'signup') {
      // Supabase may require email confirmation depending on your settings
      setErrorMsg('Check your email to confirm your account, then sign in.')
    }
    setLoading(null)
  }

  async function handleGuest() {
    setLoading('guest')
    const result = await continueAsGuest()
    if (result?.user) {
      router.push('/dashboard')
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-semibold">Davs AI</h1>
          <p className="text-neutral-400 mt-1">
            Track your calories anywhere, on any device.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />

          {errorMsg && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading !== null}
            className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-neutral-200 transition disabled:opacity-60"
          >
            {loading === 'form'
              ? 'Please wait…'
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-sm text-neutral-400 hover:text-white transition -mt-3"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>

        <div className="w-full flex items-center gap-3 text-neutral-600 text-xs">
          <div className="flex-1 h-px bg-neutral-800" />
          OR
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        <button
          onClick={handleGuest}
          disabled={loading !== null}
          className="w-full py-3 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-900 transition disabled:opacity-60"
        >
          {loading === 'guest' ? 'Setting up…' : 'Continue as Guest'}
        </button>

        <p className="text-xs text-neutral-500 text-center -mt-2">
          Guest data stays saved on this device, but only a full account
          lets you pick up your tracking on a different device.
        </p>
      </div>
    </div>
  )
}
