'use client'

import { StoreProvider } from '@/lib/store'
import { ToastProvider } from '@/components/toast'
import { AppShell } from '@/components/app-shell'

export default function Page() {
  return (
    <StoreProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </StoreProvider>
  )
}
