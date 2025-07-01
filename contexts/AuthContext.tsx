'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  provider: string | null
  provider_id: string | null
  department: string | null
  bio: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

interface UserRole {
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  expires_at: string | null
}

interface AuthContextType {
  // 사용자 인증
  user: User | null
  profile: UserProfile | null
  roles: UserRole[]
  session: Session | null
  loading: boolean
  signInWithProvider: (provider: 'google' | 'kakao' | 'naver') => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
  refreshRoles: () => Promise<void>
  
  // 권한 확인 함수들
  hasRole: (role: 'user' | 'moderator' | 'admin' | 'super_admin') => boolean
  isModerator: boolean
  isRoleAdmin: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 사용자 상태
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('프로필 로드 오류:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('프로필 조회 중 오류:', error)
      return null
    }
  }

  const fetchRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_uuid: userId
      })

      if (error) {
        console.error('권한 로드 오류:', error)
        return []
      }

      return data as UserRole[]
    } catch (error) {
      console.error('권한 조회 중 오류:', error)
      return []
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    
    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }

  const refreshRoles = async () => {
    if (!user) return
    
    const rolesData = await fetchRoles(user.id)
    setRoles(rolesData)
  }

  // 권한 확인 함수들
  const hasRole = (requiredRole: 'user' | 'moderator' | 'admin' | 'super_admin'): boolean => {
    if (!user || roles.length === 0) return false

    const roleHierarchy = {
      'user': 1,
      'moderator': 2,
      'admin': 3,
      'super_admin': 4
    }

    const requiredLevel = roleHierarchy[requiredRole]
    const maxUserLevel = Math.max(...roles.map(r => roleHierarchy[r.role]))

    return maxUserLevel >= requiredLevel
  }

  // 컴포넌트 렌더링 시에 계산되도록 useMemo 없이 직접 계산
  const isModerator = user && roles.length > 0 ? hasRole('moderator') : false
  const isRoleAdmin = user && roles.length > 0 ? hasRole('admin') : false  
  const isSuperAdmin = user && roles.length > 0 ? hasRole('super_admin') : false

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('사용자가 로그인되어 있지 않습니다.')

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data as UserProfile)
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      throw error
    }
  }

  const signInWithProvider = async (provider: 'google' | 'kakao' | 'naver') => {
    try {
      // 네이버는 현재 Supabase에서 직접 지원하지 않으므로 OAuth 설정 필요
      let authProvider: 'google' | 'kakao' = provider as 'google' | 'kakao'
      
      if (provider === 'naver') {
        // 네이버는 OAuth provider로 설정해야 함
        console.warn('네이버 로그인은 추가 설정이 필요합니다.')
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: authProvider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('소셜 로그인 오류:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  }


  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const [profileData, rolesData] = await Promise.all([
          fetchProfile(session.user.id),
          fetchRoles(session.user.id)
        ])
        setProfile(profileData)
        setRoles(rolesData)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // 로그인 시 프로필과 권한 로드
          const [profileData, rolesData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchRoles(session.user.id)
          ])
          
          setProfile(profileData)
          setRoles(rolesData)
          
          // 마지막 로그인 시간 업데이트
          if (profileData) {
            await supabase
              .from('user_profiles')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', session.user.id)
          }
        } else {
          // 로그아웃 시 프로필과 권한 초기화
          setProfile(null)
          setRoles([])
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    // 사용자 인증
    user,
    profile,
    roles,
    session,
    loading,
    signInWithProvider,
    signOut,
    updateProfile,
    refreshProfile,
    refreshRoles,
    
    // 권한 확인 함수들
    hasRole,
    isModerator,
    isRoleAdmin,
    isSuperAdmin
  }

  return (
    <AuthContext.Provider value={value}>
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

// 기존 호환성을 위한 별명
export const useUser = useAuth