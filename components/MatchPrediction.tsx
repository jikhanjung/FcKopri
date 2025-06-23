'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  PresentationChartBarIcon,
  StarIcon,
  UserIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

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
  user_name: string
  user_email: string | null
  predicted_home_score: number
  predicted_away_score: number
  confidence_level: number
  notes: string | null
  created_at: string
}

interface MatchPredictionProps {
  match: Match
}

export default function MatchPrediction({ match }: MatchPredictionProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // 폼 상태
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    predicted_home_score: 0,
    predicted_away_score: 0,
    confidence_level: 3,
    notes: ''
  })

  useEffect(() => {
    loadPredictions()
    
    // Supabase Realtime 구독으로 실시간 업데이트
    const channel = supabase
      .channel(`predictions_${match.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_predictions',
        filter: `match_id=eq.${match.id}`
      }, (payload) => {
        console.log('Prediction change:', payload)
        loadPredictions() // 변경사항이 있으면 다시 로드
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [match.id])

  const loadPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('match_id', match.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Predictions table not available:', error)
        setPredictions([])
        return
      }

      setPredictions(data || [])
    } catch (error) {
      console.warn('Error loading predictions:', error)
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }

  const submitPrediction = async () => {
    if (!formData.user_name.trim()) {
      alert('참여자 이름을 입력해주세요.')
      return
    }

    try {
      const predictionData = {
        match_id: match.id,
        user_name: formData.user_name.trim(),
        user_email: formData.user_email.trim() || null,
        predicted_home_score: formData.predicted_home_score,
        predicted_away_score: formData.predicted_away_score,
        confidence_level: formData.confidence_level,
        notes: formData.notes.trim() || null
      }

      const { error } = await supabase
        .from('match_predictions')
        .upsert([predictionData], { 
          onConflict: 'match_id,user_email'
        })

      if (error) throw error

      setShowForm(false)
      setFormData({
        user_name: '',
        user_email: '',
        predicted_home_score: 0,
        predicted_away_score: 0,
        confidence_level: 3,
        notes: ''
      })
      
      // 실시간 업데이트로 자동 로드되므로 loadPredictions() 호출 불필요
      alert('참여가 완료되었습니다!')
    } catch (error) {
      console.error('Error submitting prediction:', error)
      alert('참여 중 오류가 발생했습니다.')
    }
  }

  const getConfidenceStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < level ? (
          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ))
  }

  const getAccuracyScore = (prediction: Prediction) => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null
    }

    const actualHome = match.home_score
    const actualAway = match.away_score
    const predHome = prediction.predicted_home_score
    const predAway = prediction.predicted_away_score

    // 정확한 스코어 맞춤
    if (actualHome === predHome && actualAway === predAway) {
      return { score: 100, label: '완벽!', color: 'text-green-600' }
    }

    // 승부 결과만 맞춤
    const actualResult = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw'
    const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw'
    
    if (actualResult === predResult) {
      return { score: 50, label: '승부적중', color: 'text-blue-600' }
    }

    return { score: 0, label: '오답', color: 'text-red-600' }
  }

  const getPredictionStats = () => {
    if (predictions.length === 0) return null

    const homeWins = predictions.filter(p => p.predicted_home_score > p.predicted_away_score).length
    const awayWins = predictions.filter(p => p.predicted_home_score < p.predicted_away_score).length
    const draws = predictions.filter(p => p.predicted_home_score === p.predicted_away_score).length

    return { homeWins, awayWins, draws, total: predictions.length }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 경기가 완료되었으면 예측 불가
  const canPredict = match.status === 'scheduled'
  const stats = getPredictionStats()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <PresentationChartBarIcon className="w-6 h-6 text-kopri-blue mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            경기 결과 맞히기 ({predictions.length}명 참여)
          </h3>
        </div>
        
        {canPredict && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-kopri-blue text-white rounded-lg hover:bg-kopri-blue/90"
          >
            {showForm ? '취소' : '참여하기'}
          </button>
        )}
      </div>

      {/* 예측 통계 */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-kopri-blue">
              {Math.round((stats.homeWins / stats.total) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {match.home_team?.name} 승리
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-500">
              {Math.round((stats.draws / stats.total) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">무승부</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-kopri-blue">
              {Math.round((stats.awayWins / stats.total) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {match.away_team?.name} 승리
            </div>
          </div>
        </div>
      )}

      {/* 예측 폼 */}
      {showForm && canPredict && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">경기 결과 맞히기</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름 *
              </label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="참여자 이름"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일 (선택)
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="이메일 주소"
              />
            </div>
          </div>

          {/* 스코어 예측 */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {match.home_team?.name}
              </div>
              <input
                type="number"
                min="0"
                value={formData.predicted_home_score}
                onChange={(e) => setFormData({ ...formData, predicted_home_score: parseInt(e.target.value) || 0 })}
                className="w-16 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="text-2xl font-bold text-gray-400">:</div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {match.away_team?.name}
              </div>
              <input
                type="number"
                min="0"
                value={formData.predicted_away_score}
                onChange={(e) => setFormData({ ...formData, predicted_away_score: parseInt(e.target.value) || 0 })}
                className="w-16 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* 확신도 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              확신도
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, confidence_level: level })}
                  className="p-1"
                >
                  {level <= formData.confidence_level ? (
                    <StarSolidIcon className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-6 h-6 text-gray-300" />
                  )}
                </button>
              ))}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                {formData.confidence_level}/5
              </span>
            </div>
          </div>

          {/* 메모 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              예측 근거 (선택)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={2}
              placeholder="예측 이유나 근거를 적어주세요"
            />
          </div>

          <button
            onClick={submitPrediction}
            className="w-full bg-kopri-blue text-white py-2 rounded-lg hover:bg-kopri-blue/90"
          >
            참여하기
          </button>
        </div>
      )}

      {/* 예측 목록 */}
      <div className="space-y-3">
        {predictions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {canPredict ? (
              <div>
                <div className="animate-pulse mb-2">⚽</div>
                <div>첫 번째로 참여해보세요!</div>
              </div>
            ) : (
              '이 경기에 대한 예측이 없습니다.'
            )}
          </div>
        ) : (
          predictions.map((prediction) => {
            const accuracy = getAccuracyScore(prediction)
            return (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {prediction.user_name}
                    </span>
                  </div>
                  
                  <div className="text-lg font-bold text-kopri-blue">
                    {prediction.predicted_home_score} - {prediction.predicted_away_score}
                  </div>
                  
                  <div className="flex items-center">
                    {getConfidenceStars(prediction.confidence_level)}
                  </div>
                  
                  {accuracy && (
                    <div className={`text-sm font-medium ${accuracy.color}`}>
                      {accuracy.label}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(prediction.created_at).toLocaleDateString('ko-KR')}
                  </div>
                  {prediction.notes && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xs truncate">
                      {prediction.notes}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {!canPredict && match.status !== 'completed' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              경기가 시작되어 더 이상 참여할 수 없습니다.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}