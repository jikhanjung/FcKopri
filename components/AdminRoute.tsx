'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LockClosedIcon } from '@heroicons/react/24/outline'

interface AdminRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AdminRoute({ children, redirectTo = '/admin/login' }: AdminRouteProps) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push(redirectTo)
    }
  }, [isAdmin, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <LockClosedIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">권한이 필요합니다</h2>
          <p className="text-gray-600 mb-4">이 페이지에 접근하려면 관리자 권한이 필요합니다.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90"
          >
            로그인하기
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// 어드민 권한이 필요한 버튼/링크를 조건부로 표시하는 컴포넌트
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const { isAdmin } = useAuth()
  
  if (!isAdmin) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}