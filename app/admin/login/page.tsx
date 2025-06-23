'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LockClosedIcon } from '@heroicons/react/24/outline'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isAdmin, loading: authLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 이미 로그인된 상태라면 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.push('/')
    }
  }, [isAdmin, authLoading, router])

  // 로딩 중이거나 이미 로그인된 상태라면 로딩 화면 표시
  if (authLoading || isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto mb-4"></div>
          <p className="text-gray-600">처리 중...</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    const success = login(password)
    if (success) {
      router.push('/')
    } else {
      setError('비밀번호가 올바르지 않습니다.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-kopri-blue rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">어드민 로그인</h2>
            <p className="text-gray-600 mt-2">관리자 권한이 필요합니다</p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                placeholder="어드민 비밀번호를 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kopri-blue text-white py-2 px-4 rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 개발용 힌트 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">개발용 정보</h3>
            <p className="text-sm text-yellow-700">비밀번호: <code className="bg-yellow-100 px-1 rounded">kopri2025</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}