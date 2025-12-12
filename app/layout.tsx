import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/AuthContext'
import Navigation from '@/components/Navigation'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export const metadata: Metadata = {
  title: 'SOC Time-sag',
  description: 'Roskilde Tekniske Skole - Skole Oplærings Centret',
  icons: {
    icon: '/rts_color.svg',
    shortcut: '/rts_color.svg',
    apple: '/rts_color.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      <body>
        <AuthProvider>
          <div className="layout">
            <header className="header">
              <div className="header__brand">
                <span>SOC Time-sag</span>
                <img src="/rts_color.svg" alt="RTS" />
              </div>
              <Navigation />
              <div className="header__bottom">
                <ThemeSwitcher />
              </div>
            </header>
            <main className="main">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
