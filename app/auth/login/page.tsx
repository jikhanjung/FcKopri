'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SocialLogin from '@/components/SocialLogin'
import EmailLogin from '@/components/EmailLogin'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 사용자는 홈으로 리다이렉트
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kopri-blue"></div>
      </div>
    )
  }

  if (user) {
    return null // 리다이렉트 중
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-kopri-blue mb-2">
            FcKopri
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            축구 리그 관리 시스템
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <EmailLogin />
          
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">또는</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          
          <SocialLogin />
        </div>
        
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-kopri-blue hover:underline text-sm"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}