'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  TrophyIcon, 
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PlayoffMatch {
  id: string
  home_team_id: string | null
  away_team_id: string | null
  match_date: string | null
  home_score: number | null
  away_score: number | null
  status: string
  home_team: { id: string; name: string } | null
  away_team: { id: string; name: string } | null
}

// MatchCard 컴포넌트
function MatchCard({ match, isChampionship = false }: { match: PlayoffMatch; isChampionship?: boolean }) {
  const getWinner = (match: PlayoffMatch) => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null
    }
    
    if (match.home_score > match.away_score) {
      return { team: match.home_team, score: match.home_score }
    } else if (match.away_score > match.home_score) {
      return { team: match.away_team, score: match.away_score }
    }
    return null
  }

  const winner = getWinner(match)
  const borderColor = isChampionship ? 'border-yellow-400' : 'border-gray-200 dark:border-gray-600'
  const hoverBorderColor = isChampionship ? 'hover:border-yellow-500' : 'hover:border-kopri-blue dark:hover:border-kopri-lightblue'
  
  return (
    <Link 
      href={`/matches/${match.id}`}
      className={`bg-gray-50 dark:bg-gray-700 border-2 ${borderColor} rounded-lg p-4 w-64 ${hoverBorderColor} hover:shadow-md transition-all block`}
    >
      <div className="space-y-3">
        {/* 홈팀 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${winner?.team?.id === match.home_team?.id ? 'text-kopri-blue dark:text-kopri-lightblue font-bold' : 'text-gray-700 dark:text-gray-200'}`}>
            {match.home_team?.name || '미정'}
          </span>
          {match.status === 'completed' && match.home_score !== null && (
            <span className={`text-lg font-bold ${winner?.team?.id === match.home_team?.id ? 'text-kopri-blue dark:text-kopri-lightblue' : 'text-gray-600 dark:text-gray-400'}`}>
              {match.home_score}
            </span>
          )}
        </div>
        
        {/* VS */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          VS
        </div>
        
        {/* 원정팀 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${winner?.team?.id === match.away_team?.id ? 'text-kopri-blue dark:text-kopri-lightblue font-bold' : 'text-gray-700 dark:text-gray-200'}`}>
            {match.away_team?.name || '미정'}
          </span>
          {match.status === 'completed' && match.away_score !== null && (
            <span className={`text-lg font-bold ${winner?.team?.id === match.away_team?.id ? 'text-kopri-blue dark:text-kopri-lightblue' : 'text-gray-600 dark:text-gray-400'}`}>
              {match.away_score}
            </span>
          )}
        </div>
        
        {/* 경기 정보 */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${
              match.status === 'completed' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' : 
              match.status === 'in_progress' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100' : 
              'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
            }`}>
              {match.status === 'completed' ? '완료' : match.status === 'in_progress' ? '진행중' : '예정'}
            </span>
            {match.match_date && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(match.match_date), 'M/d HH:mm')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function PlayoffsPage() {
  const [playoffMatches, setPlayoffMatches] = useState<PlayoffMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlayoffMatches() {
      try {
        // 모든 경기를 가져와서 플레이오프 경기만 필터링 (마지막 3경기)
        const { data: allMatches, error } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(id, name),
            away_team:teams!matches_away_team_id_fkey(id, name)
          `)
          .order('created_at', { ascending: true })

        if (error) throw error

        // 마지막 3경기가 플레이오프 (7, 8, 9번째 경기)
        const playoffs = (allMatches || []).slice(-3)
        setPlayoffMatches(playoffs)
      } catch (error) {
        console.error('Error fetching playoff matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayoffMatches()
  }, [])

  const getMatchTitle = (index: number) => {
    const titles = ['3/4위전', '준결승', '결승']
    return titles[index] || `플레이오프 ${index + 1}`
  }

  const getMatchDescription = (index: number) => {
    const descriptions = [
      '3위와 4위가 겨루는 경기',
      '2위와 3/4위전 승자가 겨루는 경기', 
      '1위와 준결승 승자가 겨루는 결승전'
    ]
    return descriptions[index] || ''
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

  const getWinner = (match: PlayoffMatch) => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null
    }
    
    if (match.home_score > match.away_score) {
      return { team: match.home_team, score: match.home_score }
    } else if (match.away_score > match.home_score) {
      return { team: match.away_team, score: match.away_score }
    }
    return null // 무승부
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <TrophyIcon className="w-8 h-8 mr-3 text-kopri-blue dark:text-kopri-lightblue" />
            플레이오프 대진표
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">제 1회 KOPRI CUP 플레이오프 토너먼트</p>
        </div>

        {/* 플레이오프가 없는 경우 */}
        {playoffMatches.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">플레이오프 경기가 없습니다</h3>
            <p className="text-gray-600">아직 플레이오프 일정이 등록되지 않았습니다</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 플레이오프 브래킷 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">토너먼트 브래킷</h2>
              
              {/* 트리 형태의 브래킷 */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-max py-8 px-4">
                  <div className="relative">
                    {/* 결승전 (맨 위) - 중심: 380px = (251 + 510) / 2 */}
                    <div className="flex justify-start" style={{ marginTop: '0px', marginLeft: '248px' }}>
                      {playoffMatches[2] && (
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            결승
                          </div>
                          <MatchCard match={playoffMatches[2]} isChampionship />
                        </div>
                      )}
                    </div>
                    
                    {/* 결승 연결선 */}
                    {/* 결승에서 아래로 */}
                    <div style={{ position: 'absolute', top: '120px', left: '380px', width: '1px', height: '20px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 가로선 (준결승과 1위 연결) */}
                    <div style={{ position: 'absolute', top: '140px', left: '251px', width: '259px', height: '1px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 준결승으로 아래로 */}
                    <div style={{ position: 'absolute', top: '140px', left: '251px', width: '1px', height: '40px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 1위로 아래로 */}
                    <div style={{ position: 'absolute', top: '140px', left: '510px', width: '1px', height: '240px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    
                    {/* 준결승 - 중심: 251px = (140 + 362) / 2 */}
                    <div className="flex justify-start" style={{ marginTop: '60px', marginLeft: '119px' }}>
                      {playoffMatches[1] && (
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            준결승
                          </div>
                          <MatchCard match={playoffMatches[1]} />
                        </div>
                      )}
                    </div>
                    
                    {/* 준결승 연결선 */}
                    {/* 준결승에서 아래로 */}
                    <div style={{ position: 'absolute', top: '240px', left: '251px', width: '1px', height: '20px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 가로선 (3/4위전과 2위 연결) */}
                    <div style={{ position: 'absolute', top: '260px', left: '140px', width: '222px', height: '1px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 3/4위전으로 아래로 */}
                    <div style={{ position: 'absolute', top: '260px', left: '140px', width: '1px', height: '40px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 2위로 아래로 */}
                    <div style={{ position: 'absolute', top: '260px', left: '362px', width: '1px', height: '120px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    
                    {/* 3/4위전 - 중심: 140px = (66 + 214) / 2 */}
                    <div className="flex justify-start" style={{ marginTop: '60px', marginLeft: '8px' }}>
                      {playoffMatches[0] && (
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            3/4위전
                          </div>
                          <MatchCard match={playoffMatches[0]} />
                        </div>
                      )}
                    </div>
                    
                    {/* 3/4위전 연결선 */}
                    {/* 3/4위전에서 아래로 */}
                    <div style={{ position: 'absolute', top: '360px', left: '140px', width: '1px', height: '20px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 가로선 (3위와 4위 연결) */}
                    <div style={{ position: 'absolute', top: '380px', left: '66px', width: '148px', height: '1px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 3위로 아래로 */}
                    <div style={{ position: 'absolute', top: '380px', left: '66px', width: '1px', height: '20px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    {/* 4위로 아래로 */}
                    <div style={{ position: 'absolute', top: '380px', left: '214px', width: '1px', height: '20px' }} className="bg-gray-300 dark:bg-gray-600"></div>
                    
                    {/* 모든 팀들 (맨 아래) */}
                    <div className="flex gap-16" style={{ marginTop: '20px' }}>
                      {/* 3위 팀 - 중심: 66px */}
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          3위
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 w-32">
                          <div className="text-center text-gray-700 dark:text-gray-200 font-medium">
                            3위
                          </div>
                        </div>
                      </div>
                      
                      {/* 4위 팀 - 중심: 214px (66 + 148) */}
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          4위
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 w-32">
                          <div className="text-center text-gray-700 dark:text-gray-200 font-medium">
                            4위
                          </div>
                        </div>
                      </div>
                      
                      {/* 2위 팀 - 중심: 362px (214 + 148) */}
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          2위
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 w-32">
                          <div className="text-center text-gray-700 dark:text-gray-200 font-medium">
                            2위
                          </div>
                        </div>
                      </div>
                      
                      {/* 1위 팀 - 중심: 510px (362 + 148) */}
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          1위
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 w-32">
                          <div className="text-center text-gray-700 dark:text-gray-200 font-medium">
                            1위
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 경기 일정 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">경기 일정</h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {playoffMatches.map((match, index) => (
                  <Link 
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 text-center">
                            <div className="text-sm font-medium text-kopri-blue dark:text-kopri-lightblue">
                              {getMatchTitle(index)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {match.home_team?.name || '미정'}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">VS</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {match.away_team?.name || '미정'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {getMatchDescription(index)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {match.status === 'completed' && match.home_score !== null && match.away_score !== null && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-kopri-blue dark:text-kopri-lightblue">
                              {match.home_score} - {match.away_score}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-right">
                          {getStatusBadge(match.status)}
                          {match.match_date && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {format(new Date(match.match_date), 'M월 d일 (EEE)', { locale: ko })}
                              <ClockIcon className="w-4 h-4 ml-2 mr-1" />
                              {format(new Date(match.match_date), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 우승 트로피 */}
            {playoffMatches.length > 0 && playoffMatches[playoffMatches.length - 1].status === 'completed' && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
                <TrophyIcon className="w-16 h-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  🏆 제 1회 KOPRI CUP 우승팀 🏆
                </h3>
                <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  {getWinner(playoffMatches[playoffMatches.length - 1])?.team?.name || '미정'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}