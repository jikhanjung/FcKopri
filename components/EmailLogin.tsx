'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface EmailLoginProps {
  onClose?: () => void
}

export default function EmailLogin({ onClose }: EmailLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0]
            }
          }
        })
        
        if (error) throw error
        setMessage('회원가입이 완료되었습니다! 로그인해주세요.')
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        if (onClose) {
          onClose()
        }
      }
    } catch (error: any) {
      console.error('이메일 인증 오류:', error)
      setMessage(error.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isSignUp ? '회원가입' : '이메일 로그인'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isSignUp ? '새 계정을 만들어주세요' : '기존 계정으로 로그인하세요'}
        </p>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="비밀번호를 입력하세요"
            required
            minLength={6}
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('완료') 
              ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-kopri-blue text-white py-2 px-4 rounded-lg font-medium hover:bg-kopri-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setMessage('')
          }}
          className="text-sm text-kopri-blue hover:underline"
        >
          {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
        </button>
      </div>
    </div>
  )
}