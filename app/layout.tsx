import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'NutriLens — AI Calorie & Macro Tracker',
  description:
    'Track calories and macros with AI food scanning, water logging, and weekly trends. Your data stays on your device.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfdfb' },
    { media: '(prefers-color-scheme: dark)', color: '#111813' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nutrilens.theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
