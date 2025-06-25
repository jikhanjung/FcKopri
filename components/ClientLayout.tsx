'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import Navigation from '@/components/Navigation'
import ToastNotification from '@/components/ToastNotification'
import Footer from '@/components/Footer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <ToastNotification />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}