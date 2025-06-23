'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import Navigation from '@/components/Navigation'
import ToastNotification from '@/components/ToastNotification'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <main>
              {children}
            </main>
            <ToastNotification />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}