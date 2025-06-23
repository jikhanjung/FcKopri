'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface LivePrediction {
  id: string
  user_name: string
  predicted_home_score: number
  predicted_away_score: number
  confidence_level: number
  created_at: string
}

interface LivePredictionFeedProps {
  matchId: string
  homeTeamName: string
  awayTeamName: string
}

export default function LivePredictionFeed({ matchId, homeTeamName, awayTeamName }: LivePredictionFeedProps) {
  const [recentPredictions, setRecentPredictions] = useState<LivePrediction[]>([])

  useEffect(() => {
    // 실시간 예측 피드 구독
    const channel = supabase
      .channel(`live_predictions_${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'match_predictions',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        const newPrediction = payload.new as LivePrediction
        
        // 새로운 예측을 최상단에 추가하고 5개까지만 유지
        setRecentPredictions(prev => [newPrediction, ...prev].slice(0, 5))
        
        // 3초 후에 해당 예측 제거 (애니메이션 효과)
        setTimeout(() => {
          setRecentPredictions(prev => prev.filter(p => p.id !== newPrediction.id))
        }, 5000)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  const getConfidenceStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < level ? (
          <StarSolidIcon className="w-3 h-3 text-yellow-400" />
        ) : (
          <StarIcon className="w-3 h-3 text-gray-300" />
        )}
      </span>
    ))
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)
    
    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    return `${Math.floor(diffInSeconds / 3600)}시간 전`
  }

  if (recentPredictions.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full">
      <div className="space-y-2">
        {recentPredictions.map((prediction, index) => (
          <div
            key={prediction.id}
            className={`
              transform transition-all duration-500 ease-out
              ${index === 0 ? 'animate-slide-in-right' : ''}
              bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-3
              opacity-90 hover:opacity-100
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: Math.max(0.3, 1 - (index * 0.2))
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {prediction.user_name}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(prediction.created_at)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {homeTeamName} vs {awayTeamName}
              </div>
              <div className="font-bold text-kopri-blue">
                {prediction.predicted_home_score}-{prediction.predicted_away_score}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex">
                {getConfidenceStars(prediction.confidence_level)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                새 참여!
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 0.9;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}