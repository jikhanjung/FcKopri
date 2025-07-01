'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('인증 콜백 오류:', error)
          router.push('/auth/error?message=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // 로그인 성공, 홈으로 리다이렉트
          router.push('/')
        } else {
          // 세션이 없으면 로그인 페이지로
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('예상치 못한 오류:', error)
        router.push('/auth/error?message=' + encodeURIComponent('예상치 못한 오류가 발생했습니다.'))
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kopri-blue mx-auto"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
            로그인 처리 중...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  )
}