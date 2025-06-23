'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { updatePlayoffFromMatchResult } from '@/lib/playoff-utils'
import MatchLive from '@/components/MatchLive'
import MatchPrediction from '@/components/MatchPrediction'
import LivePredictionFeed from '@/components/LivePredictionFeed'
import MatchPhotos from '@/components/MatchPhotos'
import ManOfTheMatchSelector from '@/components/ManOfTheMatchSelector'

interface Player {
  id: string
  name: string
  team_id: string
}

interface MatchDetail {
  id: string
  home_team_id: string | null
  away_team_id: string | null
  match_date: string | null
  home_score: number | null
  away_score: number | null
  status: string
  man_of_the_match_id: string | null
  created_at: string
  home_team: { id: string; name: string; players: Player[] } | null
  away_team: { id: string; name: string; players: Player[] } | null
}

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    home_score: '',
    away_score: '',
    status: 'scheduled'
  })

  useEffect(() => {
    async function fetchMatch() {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(id, name, players(id, name, team_id)),
            away_team:teams!matches_away_team_id_fkey(id, name, players(id, name, team_id))
          `)
          .eq('id', matchId)
          .single()

        if (error) throw error
        
        setMatch(data)
        setFormData({
          home_score: data.home_score?.toString() || '',
          away_score: data.away_score?.toString() || '',
          status: data.status
        })
      } catch (error) {
        console.error('Error fetching match:', error)
        router.push('/matches')
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      fetchMatch()
    }
  }, [matchId, router])

  async function handleSave() {
    if (!match) return

    try {
      const updates: any = {
        status: formData.status
      }

      // 점수가 입력된 경우에만 업데이트
      if (formData.home_score !== '') {
        updates.home_score = parseInt(formData.home_score)
      }
      if (formData.away_score !== '') {
        updates.away_score = parseInt(formData.away_score)
      }

      const { error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', matchId)

      if (error) throw error

      // 상태 업데이트
      setMatch({
        ...match,
        ...updates
      })
      setEditMode(false)
      
      // 경기가 완료된 경우 플레이오프 업데이트 확인
      if (formData.status === 'completed') {
        await updatePlayoffFromMatchResult(matchId)
      }
      
      alert('경기 정보가 업데이트되었습니다.')
    } catch (error) {
      console.error('Error updating match:', error)
      alert('업데이트 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      scheduled: '예정',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소'
    }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">경기를 찾을 수 없습니다</h1>
          <Link href="/matches" className="text-kopri-blue hover:underline">
            경기 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/matches"
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">경기 상세</h1>
              {match.match_date && (
                <p className="text-gray-600 mt-2">
                  {format(new Date(match.match_date), 'yyyy년 M월 d일 (EEE) HH:mm', { locale: ko })}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(match.status)}
            <AdminOnly>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  수정
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                </div>
              )}
            </AdminOnly>
          </div>
        </div>

        {/* 경기 정보 카드 */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-center justify-center">
            {/* 홈팀 */}
            <div className="text-center flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {match.home_team?.name || '미정'}
              </h2>
              {match.status === 'completed' && (
                <div className="text-6xl font-bold text-kopri-blue">
                  {match.home_score ?? 0}
                </div>
              )}
              {editMode && (
                <input
                  type="number"
                  min="0"
                  value={formData.home_score}
                  onChange={(e) => setFormData({ ...formData, home_score: e.target.value })}
                  className="mt-4 w-20 px-3 py-2 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                  placeholder="0"
                />
              )}
            </div>

            {/* VS */}
            <div className="mx-8">
              <div className="text-2xl font-bold text-gray-400">VS</div>
              {match.match_date && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center mb-1">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {format(new Date(match.match_date), 'M월 d일 (EEE)', { locale: ko })}
                  </div>
                  <div className="flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {format(new Date(match.match_date), 'HH:mm')}
                  </div>
                </div>
              )}
            </div>

            {/* 원정팀 */}
            <div className="text-center flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {match.away_team?.name || '미정'}
              </h2>
              {match.status === 'completed' && (
                <div className="text-6xl font-bold text-kopri-blue">
                  {match.away_score ?? 0}
                </div>
              )}
              {editMode && (
                <input
                  type="number"
                  min="0"
                  value={formData.away_score}
                  onChange={(e) => setFormData({ ...formData, away_score: e.target.value })}
                  className="mt-4 w-20 px-3 py-2 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                  placeholder="0"
                />
              )}
            </div>
          </div>

          {editMode && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                경기 상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue"
              >
                <option value="scheduled">예정</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </div>
          )}
        </div>

        {/* 실시간 경기 진행 */}
        {match.status === 'in_progress' && match.home_team && match.away_team && (
          <div className="mb-8">
            <MatchLive
              matchId={matchId}
              homeTeam={{
                id: match.home_team.id,
                name: match.home_team.name,
                players: match.home_team.players || []
              }}
              awayTeam={{
                id: match.away_team.id,
                name: match.away_team.name,
                players: match.away_team.players || []
              }}
              onScoreUpdate={(homeScore, awayScore) => {
                setMatch(prev => prev ? {
                  ...prev,
                  home_score: homeScore,
                  away_score: awayScore
                } : null)
              }}
            />
          </div>
        )}

        {/* 경기 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 경기 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              경기 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">경기 번호:</span>
                <span className="font-medium">#{match.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태:</span>
                <span>{getStatusBadge(match.status)}</span>
              </div>
              {match.match_date && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">날짜:</span>
                    <span className="font-medium">
                      {format(new Date(match.match_date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">시간:</span>
                    <span className="font-medium">
                      {format(new Date(match.match_date), 'HH:mm')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 결과 요약 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2" />
              경기 결과
            </h3>
            {match.status === 'completed' && match.home_score !== null && match.away_score !== null ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">최종 스코어:</span>
                  <span className="text-xl font-bold text-kopri-blue">
                    {match.home_score} - {match.away_score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">승리 팀:</span>
                  <span className="font-medium">
                    {match.home_score > match.away_score 
                      ? match.home_team?.name 
                      : match.home_score < match.away_score 
                        ? match.away_team?.name 
                        : '무승부'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">득점 차:</span>
                  <span className="font-medium">
                    {Math.abs(match.home_score - match.away_score)}점
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                {match.status === 'scheduled' && '경기 예정'}
                {match.status === 'in_progress' && '경기 진행중'}
                {match.status === 'cancelled' && '경기 취소'}
              </p>
            )}
          </div>
        </div>

        {/* 경기 예측 */}
        <div className="mt-8">
          <MatchPrediction 
            match={{
              id: match.id,
              home_team: match.home_team,
              away_team: match.away_team,
              match_date: match.match_date,
              status: match.status,
              home_score: match.home_score,
              away_score: match.away_score
            }} 
          />
        </div>

        {/* 실시간 예측 피드 */}
        {match.status === 'scheduled' && match.home_team && match.away_team && (
          <LivePredictionFeed
            matchId={match.id}
            homeTeamName={match.home_team.name}
            awayTeamName={match.away_team.name}
          />
        )}

        {/* Man of the Match */}
        {match.home_team && match.away_team && (
          <div className="mt-8">
            <ManOfTheMatchSelector
              matchId={match.id}
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              currentMotmId={match.man_of_the_match_id}
              onMotmChange={(playerId) => {
                setMatch(prev => prev ? { ...prev, man_of_the_match_id: playerId } : null)
              }}
            />
          </div>
        )}

        {/* 경기 사진 */}
        <div className="mt-8">
          <MatchPhotos matchId={match.id} />
        </div>
      </div>
    </div>
  )
}