'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface SocialLoginProps {
  onClose?: () => void
  redirectTo?: string
}

export default function SocialLogin({ onClose, redirectTo }: SocialLoginProps) {
  const { signInWithProvider } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    try {
      setLoading(provider)
      
      if (provider === 'naver') {
        // 네이버 로그인은 추후 구현
        alert('네이버 로그인은 준비 중입니다.')
        return
      }
      
      await signInWithProvider(provider)
      
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error)
      alert('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  const providers = [
    {
      id: 'google' as const,
      name: '구글',
      bgColor: 'bg-white',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      hoverColor: 'hover:bg-gray-50',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )
    },
    {
      id: 'kakao' as const,
      name: '카카오',
      bgColor: 'bg-yellow-400',
      textColor: 'text-gray-900',
      borderColor: 'border-yellow-400',
      hoverColor: 'hover:bg-yellow-500',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
        </svg>
      )
    },
    {
      id: 'naver' as const,
      name: '네이버',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-500',
      hoverColor: 'hover:bg-green-600',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          로그인
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          소셜 계정으로 간편하게 로그인하세요
        </p>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={loading !== null}
            className={`
              w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors
              ${provider.bgColor} ${provider.textColor} ${provider.borderColor} ${provider.hoverColor}
              border-2 disabled:opacity-50 disabled:cursor-not-allowed
              ${loading === provider.id ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading === provider.id ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
            ) : (
              <span className="mr-3">{provider.icon}</span>
            )}
            
            {loading === provider.id ? '로그인 중...' : `${provider.name}로 로그인`}
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        로그인하면{' '}
        <button className="text-kopri-blue hover:underline">
          이용약관
        </button>
        {' '}및{' '}
        <button className="text-kopri-blue hover:underline">
          개인정보처리방침
        </button>
        에 동의하는 것으로 간주됩니다.
      </div>
    </div>
  )
}