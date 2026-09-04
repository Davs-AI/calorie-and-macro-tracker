import { supabase } from './supabase'

// Creates a brand new account with email + password
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) console.error('Sign-up error:', error.message)
  return { data, error }
}

// Logs an existing user in with email + password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) console.error('Sign-in error:', error.message)
  return { data, error }
}

// Creates a real (but anonymous) account so guest data still syncs
// to Supabase and can be upgraded to a full account later.
export async function continueAsGuest() {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) console.error('Guest sign-in error:', error.message)
  return data
}

// Call this when a guest later wants to save their data permanently
// by attaching an email + password to their existing anonymous account,
// instead of creating a brand-new, disconnected account.
export async function upgradeGuestToEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.updateUser({ email, password })
  if (error) console.error('Account upgrade error:', error.message)
  return { data, error }
}

// Signs the current user out completely.
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Sign-out error:', error.message)
}

// Returns the current user (or null if nobody is signed in at all).
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}
