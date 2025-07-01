'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LockClosedIcon } from '@heroicons/react/24/outline'

interface AdminRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requiredRole?: 'moderator' | 'admin' | 'super_admin'
}

export default function AdminRoute({ 
  children, 
  redirectTo = '/auth/login',
  requiredRole = 'admin'
}: AdminRouteProps) {
  const { user, hasRole, loading } = useAuth()
  const router = useRouter()

  const hasRequiredRole = hasRole(requiredRole)

  useEffect(() => {
    if (!loading && (!user || !hasRequiredRole)) {
      router.push(redirectTo)
    }
  }, [user, hasRequiredRole, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasRequiredRole) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <LockClosedIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">권한이 필요합니다</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            이 페이지에 접근하려면 {requiredRole === 'super_admin' ? '슈퍼관리자' : 
                                requiredRole === 'admin' ? '관리자' : '운영자'} 권한이 필요합니다.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90"
          >
            {user ? '홈으로 돌아가기' : '로그인하기'}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// 관리자 권한이 필요한 버튼/링크를 조건부로 표시하는 컴포넌트
export function AdminOnly({ 
  children, 
  fallback = null,
  requiredRole = 'admin'
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredRole?: 'moderator' | 'admin' | 'super_admin'
}) {
  const { user, hasRole } = useAuth()
  
  if (!user || !hasRole(requiredRole)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}