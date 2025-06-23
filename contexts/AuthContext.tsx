'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 간단한 어드민 비밀번호 (실제 운영에서는 더 안전한 방법 사용)
const ADMIN_PASSWORD = 'kopri2025'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 인증 상태 확인
    const adminStatus = localStorage.getItem('kopri-admin')
    if (adminStatus === 'true') {
      setIsAdmin(true)
    }
    setLoading(false)
  }, [])

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      localStorage.setItem('kopri-admin', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem('kopri-admin')
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}