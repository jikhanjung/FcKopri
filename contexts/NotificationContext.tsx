'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  type: 'match_result' | 'match_created' | 'standings_updated' | 'playoff_updated'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    console.error('useNotifications must be used within a NotificationProvider')
    return {
      notifications: [] as Notification[],
      unreadCount: 0,
      addNotification: () => console.warn('Notification add not available'),
      markAsRead: () => console.warn('Mark as read not available'),
      markAllAsRead: () => console.warn('Mark all as read not available'),
      clearNotifications: () => console.warn('Clear notifications not available')
    }
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Supabase Realtime 구독
  useEffect(() => {
    // 경기 결과 업데이트 감지
    const matchChannel = supabase
      .channel('matches_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches'
      }, (payload) => {
        const match = payload.new as any
        if (match.status === 'completed' && match.home_score !== null && match.away_score !== null) {
          addNotification({
            type: 'match_result',
            title: '경기 결과 업데이트',
            message: `경기 결과가 입력되었습니다: ${match.home_score} - ${match.away_score}`
          })
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches'
      }, (payload) => {
        addNotification({
          type: 'match_created',
          title: '새 경기 일정',
          message: '새로운 경기가 추가되었습니다'
        })
      })
      .subscribe()

    // 플레이오프 경기 업데이트 감지
    const playoffChannel = supabase
      .channel('playoff_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'playoff_matches'
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const match = payload.new as any
          if (match.status === 'completed') {
            addNotification({
              type: 'playoff_updated',
              title: '플레이오프 결과',
              message: '플레이오프 경기 결과가 업데이트되었습니다'
            })
          }
        } else if (payload.eventType === 'INSERT') {
          addNotification({
            type: 'playoff_updated',
            title: '플레이오프 시작',
            message: '플레이오프 경기가 생성되었습니다'
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(matchChannel)
      supabase.removeChannel(playoffChannel)
    }
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}