'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useNotifications } from '@/contexts/NotificationContext'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  onClose: () => void
}

function Toast({ id, type, title, message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 애니메이션 완료 후 제거
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'error':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`max-w-sm w-full ${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="rounded-md inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ToastNotification() {
  const { notifications } = useNotifications()
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  }>>([])

  useEffect(() => {
    // 새 알림이 오면 토스트로 표시
    const latestNotification = notifications[0]
    if (latestNotification && !latestNotification.read) {
      const toastType = latestNotification.type === 'match_result' ? 'success' : 'info'
      
      setToasts(prev => [
        ...prev,
        {
          id: latestNotification.id,
          type: toastType,
          title: latestNotification.title,
          message: latestNotification.message
        }
      ])
    }
  }, [notifications])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}