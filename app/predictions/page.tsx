'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  PresentationChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Match {
  id: string
  home_team: { id: string; name: string } | null
  away_team: { id: string; name: string } | null
  match_date: string | null
  status: string
  home_score: number | null
  away_score: number | null
}

interface Prediction {
  id: string
  match_id: string
  user_name: string
  predicted_home_score: number
  predicted_away_score: number
  confidence_level: number
  created_at: string
}

interface PredictionWithMatch extends Prediction {
  match: Match
}

interface Leaderboard {
  user_name: string
  total_predictions: number
  perfect_scores: number
  correct_results: number
  accuracy_percentage: number
  average_confidence: number
}

export default function PredictionsPage() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [recentPredictions, setRecentPredictions] = useState<PredictionWithMatch[]>([])
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 예정된 경기들
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .eq('status', 'scheduled')
        .order('match_date')
        .limit(6)

      if (matchesError) throw matchesError

      // 최근 예측들
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('match_predictions')
        .select(`
          *,
          matches!inner(
            *,
            home_team:teams!matches_home_team_id_fkey(id, name),
            away_team:teams!matches_away_team_id_fkey(id, name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (predictionsError) {
        console.warn('Predictions not available:', predictionsError)
        setRecentPredictions([])
      } else {
        const formattedPredictions = predictionsData?.map(p => ({
          ...p,
          match: p.matches
        })) || []
        setRecentPredictions(formattedPredictions)
      }

      // 리더보드 계산
      await calculateLeaderboard()

      setUpcomingMatches(matchesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateLeaderboard = async () => {
    try {
      // 완료된 경기들의 예측 가져오기
      const { data: completedPredictions, error } = await supabase
        .from('match_predictions')
        .select(`
          *,
          matches!inner(home_score, away_score, status)
        `)
        .eq('matches.status', 'completed')
        .not('matches.home_score', 'is', null)
        .not('matches.away_score', 'is', null)

      if (error) {
        console.warn('Cannot calculate leaderboard:', error)
        setLeaderboard([])
        return
      }

      const userStats: { [key: string]: Leaderboard } = {}

      completedPredictions?.forEach(prediction => {
        const userName = prediction.user_name
        const actualHome = prediction.matches.home_score
        const actualAway = prediction.matches.away_score
        const predHome = prediction.predicted_home_score
        const predAway = prediction.predicted_away_score

        if (!userStats[userName]) {
          userStats[userName] = {
            user_name: userName,
            total_predictions: 0,
            perfect_scores: 0,
            correct_results: 0,
            accuracy_percentage: 0,
            average_confidence: 0
          }
        }

        const stats = userStats[userName]
        stats.total_predictions++

        // 완벽한 스코어
        if (actualHome === predHome && actualAway === predAway) {
          stats.perfect_scores++
          stats.correct_results++
        } else {
          // 승부 결과만 맞춤
          const actualResult = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw'
          const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw'
          
          if (actualResult === predResult) {
            stats.correct_results++
          }
        }

        stats.average_confidence = (stats.average_confidence * (stats.total_predictions - 1) + prediction.confidence_level) / stats.total_predictions
      })

      // 정확도 계산 및 정렬
      const leaderboardData = Object.values(userStats)
        .map(stats => ({
          ...stats,
          accuracy_percentage: (stats.correct_results / stats.total_predictions) * 100,
          average_confidence: Math.round(stats.average_confidence * 10) / 10
        }))
        .sort((a, b) => {
          // 정확도 우선, 같으면 완벽한 스코어 개수, 같으면 총 예측 수
          if (a.accuracy_percentage !== b.accuracy_percentage) {
            return b.accuracy_percentage - a.accuracy_percentage
          }
          if (a.perfect_scores !== b.perfect_scores) {
            return b.perfect_scores - a.perfect_scores
          }
          return b.total_predictions - a.total_predictions
        })
        .slice(0, 10)

      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Error calculating leaderboard:', error)
      setLeaderboard([])
    }
  }

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <PresentationChartBarIcon className="w-8 h-8 text-kopri-blue mr-3" />
            경기 결과 맞히기
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            다가오는 경기 결과를 예측하고 다른 사람들과 경쟁해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 예정된 경기 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 text-kopri-blue mr-2" />
                참여 가능한 경기
              </h2>
              
              {upcomingMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  예정된 경기가 없습니다
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {match.home_team?.name || '미정'}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-400">VS</div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {match.away_team?.name || '미정'}
                            </div>
                          </div>
                        </div>
                        
                        {match.match_date && (
                          <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                            <div>{format(new Date(match.match_date), 'M월 d일 (EEE)', { locale: ko })}</div>
                            <div>{format(new Date(match.match_date), 'HH:mm')}</div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 최근 예측 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">최근 참여</h2>
              
              {recentPredictions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  아직 참여가 없습니다
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPredictions.map((prediction) => (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {prediction.user_name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {prediction.match.home_team?.name} vs {prediction.match.away_team?.name}
                        </span>
                        <span className="font-bold text-kopri-blue">
                          {prediction.predicted_home_score}-{prediction.predicted_away_score}
                        </span>
                        <div className="flex">
                          {getConfidenceStars(prediction.confidence_level)}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(prediction.created_at), 'M/d HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 리더보드 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 text-kopri-blue mr-2" />
              리더보드
            </h2>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                완료된 경기가 없어 순위를 계산할 수 없습니다
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.user_name}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        : index === 1
                        ? 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        : index === 2
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : index === 1
                          ? 'bg-gray-400 text-gray-900'
                          : index === 2
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user.user_name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {user.total_predictions}회 참여
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-kopri-blue">
                        {user.accuracy_percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        완벽: {user.perfect_scores}회
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}