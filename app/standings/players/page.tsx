'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrophyIcon, UserIcon } from '@heroicons/react/24/outline'

interface PlayerStats {
  player_id: string
  player_name: string
  team_name: string
  goals: number
  assists: number
  attack_points: number
  matches_played: number
  average_points: number
  motm_count: number
}

export default function PlayersStandingsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'attack_points' | 'goals' | 'assists' | 'average_points' | 'motm_count'>('goals')

  useEffect(() => {
    loadPlayerStats()
    
    // 실시간 업데이트 구독
    const channel = supabase
      .channel('player_standings_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_events'
      }, () => {
        loadPlayerStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadPlayerStats = async () => {
    try {
      // 경기 이벤트에서 선수별 통계 계산
      const { data: eventsData, error: eventsError } = await supabase
        .from('match_events')
        .select(`
          type,
          player_id,
          players!inner(id, name, teams!inner(name))
        `)

      if (eventsError) {
        console.warn('Match events not available:', eventsError)
        setPlayerStats([])
        setLoading(false)
        return
      }

      // 선수별 통계 집계
      const playerStatsMap: { [key: string]: PlayerStats } = {}

      eventsData?.forEach(event => {
        const playerId = event.player_id
        const playerName = event.players?.name || '알 수 없음'
        const teamName = event.players?.teams?.name || '알 수 없음'

        if (!playerStatsMap[playerId]) {
          playerStatsMap[playerId] = {
            player_id: playerId,
            player_name: playerName,
            team_name: teamName,
            goals: 0,
            assists: 0,
            attack_points: 0,
            matches_played: 0,
            average_points: 0,
            motm_count: 0
          }
        }

        if (event.type === 'goal') {
          playerStatsMap[playerId].goals++
          playerStatsMap[playerId].attack_points += 1 // 골 1점
        } else if (event.type === 'assist') {
          playerStatsMap[playerId].assists++
          playerStatsMap[playerId].attack_points += 1 // 어시스트 1점
        }
      })

      // 선수별 경기 수 계산 (골이나 어시스트를 기록한 경기 수)
      for (const playerId in playerStatsMap) {
        const { data: matchesData } = await supabase
          .from('match_events')
          .select('match_id')
          .eq('player_id', playerId)

        const uniqueMatches = new Set(matchesData?.map(m => m.match_id) || [])
        playerStatsMap[playerId].matches_played = uniqueMatches.size
        playerStatsMap[playerId].average_points = uniqueMatches.size > 0 
          ? playerStatsMap[playerId].attack_points / uniqueMatches.size 
          : 0
      }

      // Man of the Match 횟수 계산
      const { data: motmData } = await supabase
        .from('matches')
        .select('man_of_the_match_id')
        .not('man_of_the_match_id', 'is', null)

      motmData?.forEach(match => {
        const playerId = match.man_of_the_match_id
        if (playerId && playerStatsMap[playerId]) {
          playerStatsMap[playerId].motm_count++
        }
      })

      const stats = Object.values(playerStatsMap)
        .filter(stat => stat.attack_points > 0) // 공격포인트가 있는 선수만
        .sort((a, b) => {
          switch (sortBy) {
            case 'attack_points':
              return b.attack_points - a.attack_points || b.goals - a.goals
            case 'assists':
              return b.assists - a.assists || b.goals - a.goals
            case 'average_points':
              return b.average_points - a.average_points
            case 'motm_count':
              return b.motm_count - a.motm_count || b.attack_points - a.attack_points
            default: // 'goals'
              return b.goals - a.goals || b.assists - a.assists
          }
        })

      setPlayerStats(stats)
    } catch (error) {
      console.error('Error loading player stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
    
    const sorted = [...playerStats].sort((a, b) => {
      switch (newSortBy) {
        case 'attack_points':
          return b.attack_points - a.attack_points || b.goals - a.goals
        case 'assists':
          return b.assists - a.assists || b.goals - a.goals
        case 'average_points':
          return b.average_points - a.average_points
        case 'motm_count':
          return b.motm_count - a.motm_count || b.attack_points - a.attack_points
        default: // 'goals'
          return b.goals - a.goals || b.assists - a.assists
      }
    })
    
    setPlayerStats(sorted)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <div className="flex items-center mb-4">
            <UserIcon className="w-8 h-8 text-kopri-blue dark:text-kopri-lightblue mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">개인 순위</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            선수별 득점 및 어시스트 통계 (골 1점, 어시스트 1점)
          </p>
        </div>

        {/* 정렬 옵션 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSortChange('attack_points')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'attack_points'
                  ? 'bg-kopri-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              공격포인트순
            </button>
            <button
              onClick={() => handleSortChange('goals')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'goals'
                  ? 'bg-kopri-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              득점순
            </button>
            <button
              onClick={() => handleSortChange('assists')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'assists'
                  ? 'bg-kopri-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              어시스트순
            </button>
            <button
              onClick={() => handleSortChange('average_points')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'average_points'
                  ? 'bg-kopri-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              경기당 평균
            </button>
            <button
              onClick={() => handleSortChange('motm_count')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'motm_count'
                  ? 'bg-kopri-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              ⭐ MOTM 횟수
            </button>
          </div>
        </div>

        {/* 개인 순위표 */}
        {playerStats.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              아직 기록된 통계가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              경기 결과가 입력되면 개인 통계가 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
              <div className="grid grid-cols-8 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="col-span-1">순위</div>
                <div className="col-span-2">선수명 (팀)</div>
                <div className="col-span-1 text-center">득점</div>
                <div className="col-span-1 text-center">어시스트</div>
                <div className="col-span-1 text-center">공격포인트</div>
                <div className="col-span-1 text-center">MOTM</div>
                <div className="col-span-1 text-center">경기당 평균</div>
              </div>
            </div>

            {/* 테이블 바디 */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {playerStats.map((player, index) => (
                <div
                  key={player.player_id}
                  className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                  }`}
                >
                  <div className="grid grid-cols-8 gap-4 items-center">
                    {/* 순위 */}
                    <div className="col-span-1">
                      <div className="flex items-center">
                        {index < 3 && (
                          <TrophyIcon
                            className={`w-5 h-5 mr-2 ${
                              index === 0
                                ? 'text-yellow-500'
                                : index === 1
                                ? 'text-gray-400'
                                : 'text-orange-400'
                            }`}
                          />
                        )}
                        <span className={`text-lg font-bold ${
                          index < 3 ? 'text-kopri-blue dark:text-kopri-lightblue' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* 선수명 (팀) */}
                    <div className="col-span-2">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {player.player_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {player.team_name}
                      </div>
                    </div>

                    {/* 득점 */}
                    <div className="col-span-1 text-center">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {player.goals}
                      </span>
                    </div>

                    {/* 어시스트 */}
                    <div className="col-span-1 text-center">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {player.assists}
                      </span>
                    </div>

                    {/* 공격포인트 */}
                    <div className="col-span-1 text-center">
                      <span className="text-lg font-bold text-kopri-blue dark:text-kopri-lightblue">
                        {player.attack_points}
                      </span>
                    </div>

                    {/* MOTM 횟수 */}
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center">
                        <span className={`text-lg font-bold ${
                          player.motm_count > 0 ? 'text-yellow-500' : 'text-gray-400'
                        }`}>
                          {player.motm_count > 0 ? '⭐' : '-'}
                        </span>
                        {player.motm_count > 0 && (
                          <span className="ml-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            {player.motm_count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 경기당 평균 */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {player.average_points.toFixed(1)}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        ({player.matches_played}경기)
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 점수 계산 설명 */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            공격포인트 계산 방식
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div>• 득점: 1포인트</div>
            <div>• 어시스트: 1포인트</div>
            <div>• 경기당 평균: 공격포인트 ÷ 출전 경기 수</div>
          </div>
        </div>
      </div>
    </div>
  )
}