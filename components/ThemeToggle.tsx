'use client'

import { useContext } from 'react'
import { ThemeContext } from '@/contexts/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const context = useContext(ThemeContext)
  
  // ThemeProvider가 없으면 null 반환
  if (!context) {
    return null
  }
  
  const { theme, toggleTheme } = context

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${buttonSizeClasses[size]} rounded-full transition-colors duration-200 
        text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700 
        focus:outline-none focus:ring-2 focus:ring-kopri-blue dark:focus:ring-kopri-blue
        ${className}`}
      title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
    >
      {theme === 'light' ? (
        <MoonIcon className={sizeClasses[size]} />
      ) : (
        <SunIcon className={sizeClasses[size]} />
      )}
    </button>
  )
}