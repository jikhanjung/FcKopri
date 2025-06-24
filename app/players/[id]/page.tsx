'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UserIcon, TrophyIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface PlayerProfile {
  id: string
  name: string
  position?: string
  jersey_number?: number
  department?: string
  team_id: string
  team_name: string
}

interface PlayerStats {
  goals: number
  assists: number
  attack_points: number
  matches_played: number
  average_points: number
  motm_count: number
}

interface MatchRecord {
  match_id: string
  match_date: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  goals: number
  assists: number
  is_motm: boolean
}

export default function PlayerProfilePage() {
  const params = useParams()
  const playerId = params.id as string
  
  const [player, setPlayer] = useState<PlayerProfile | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [matchRecords, setMatchRecords] = useState<MatchRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (playerId) {
      loadPlayerProfile()
    }
  }, [playerId])

  const loadPlayerProfile = async () => {
    try {
      // 선수 기본 정보 조회
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select(`
          id,
          name,
          position,
          jersey_number,
          department,
          team_id,
          teams!inner(name)
        `)
        .eq('id', playerId)
        .single()

      if (playerError) {
        console.error('Player not found:', playerError)
        setLoading(false)
        return
      }

      const teamData = Array.isArray(playerData.teams) ? playerData.teams[0] : (playerData.teams as any)
      const playerProfile: PlayerProfile = {
        id: playerData.id,
        name: playerData.name,
        position: playerData.position,
        jersey_number: playerData.jersey_number,
        department: playerData.department,
        team_id: playerData.team_id,
        team_name: teamData?.name || '알 수 없음'
      }
      setPlayer(playerProfile)

      // 선수 통계 계산
      await loadPlayerStats(playerId)
      
      // 경기별 기록 조회
      await loadMatchRecords(playerId, playerData.team_id)

    } catch (error) {
      console.error('Error loading player profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPlayerStats = async (playerId: string) => {
    try {
      // 경기 이벤트에서 통계 계산
      const { data: eventsData } = await supabase
        .from('match_events')
        .select('type, match_id')
        .eq('player_id', playerId)

      let goals = 0
      let assists = 0
      const matchIds = new Set<string>()

      eventsData?.forEach(event => {
        matchIds.add(event.match_id)
        if (event.type === 'goal') goals++
        if (event.type === 'assist') assists++
      })

      const attack_points = goals + assists
      const matches_played = matchIds.size
      const average_points = matches_played > 0 ? attack_points / matches_played : 0

      // MOTM 횟수 계산
      const { data: motmData } = await supabase
        .from('matches')
        .select('id')
        .eq('man_of_the_match_id', playerId)

      const motm_count = motmData?.length || 0

      setStats({
        goals,
        assists,
        attack_points,
        matches_played,
        average_points,
        motm_count
      })
    } catch (error) {
      console.error('Error loading player stats:', error)
    }
  }

  const loadMatchRecords = async (playerId: string, teamId: string) => {
    try {
      // 선수가 속한 팀의 모든 경기 조회
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          home_score,
          away_score,
          man_of_the_match_id,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })

      if (!matchesData) return

      // 각 경기별 선수 기록 조회
      const records: MatchRecord[] = []
      
      for (const match of matchesData) {
        const { data: playerEvents } = await supabase
          .from('match_events')
          .select('type')
          .eq('match_id', match.id)
          .eq('player_id', playerId)

        let goals = 0
        let assists = 0
        
        playerEvents?.forEach(event => {
          if (event.type === 'goal') goals++
          if (event.type === 'assist') assists++
        })

        const homeTeamData = Array.isArray(match.home_team) ? match.home_team[0] : (match.home_team as any)
        const awayTeamData = Array.isArray(match.away_team) ? match.away_team[0] : (match.away_team as any)

        records.push({
          match_id: match.id,
          match_date: match.match_date,
          home_team: homeTeamData?.name || '알 수 없음',
          away_team: awayTeamData?.name || '알 수 없음',
          home_score: match.home_score || 0,
          away_score: match.away_score || 0,
          goals,
          assists,
          is_motm: match.man_of_the_match_id === playerId
        })
      }

      setMatchRecords(records)
    } catch (error) {
      console.error('Error loading match records:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            선수를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            존재하지 않는 선수 ID입니다.
          </p>
          <Link
            href="/standings/players"
            className="inline-flex items-center px-4 py-2 bg-kopri-blue text-white rounded-lg hover:bg-kopri-blue/90"
          >
            개인 순위로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-kopri-blue dark:text-kopri-lightblue mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {player.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {player.team_name}
                  {player.jersey_number && ` #${player.jersey_number}`}
                  {player.position && ` · ${player.position}`}
                </p>
              </div>
            </div>
            <Link
              href="/standings/players"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              개인 순위로 돌아가기
            </Link>
          </div>
          {player.department && (
            <div className="inline-block px-3 py-1 bg-kopri-blue/10 text-kopri-blue dark:bg-kopri-lightblue/10 dark:text-kopri-lightblue rounded-full text-sm font-medium">
              {player.department}
            </div>
          )}
        </div>

        {/* 통계 카드들 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* 득점 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.goals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">득점</div>
            </div>

            {/* 어시스트 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.assists}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">어시스트</div>
            </div>

            {/* 공격포인트 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-kopri-blue dark:text-kopri-lightblue mb-2">
                {stats.attack_points}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">공격포인트</div>
            </div>

            {/* MOTM */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {stats.motm_count > 0 ? `⭐${stats.motm_count}` : '-'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">MOTM</div>
            </div>
          </div>
        )}

        {/* 추가 통계 */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              시즌 통계
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">출전 경기</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.matches_played}경기
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">경기당 평균</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.average_points.toFixed(1)}점
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">골/어시 비율</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.assists > 0 ? (stats.goals / stats.assists).toFixed(1) : stats.goals > 0 ? '∞' : '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 경기별 기록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              경기별 기록
            </h2>
          </div>

          {matchRecords.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                아직 경기 기록이 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                완료된 경기가 있으면 기록이 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {matchRecords.map((record) => (
                <div key={record.match_id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.match_date).toLocaleDateString('ko-KR')}
                        </div>
                        {record.is_motm && (
                          <div className="flex items-center text-yellow-500">
                            <TrophyIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">MOTM</span>
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {record.home_team} {record.home_score} - {record.away_score} {record.away_team}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {record.goals > 0 || record.assists > 0 ? (
                        <div className="flex items-center space-x-4">
                          {record.goals > 0 && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {record.goals}
                              </div>
                              <div className="text-xs text-gray-500">골</div>
                            </div>
                          )}
                          {record.assists > 0 && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {record.assists}
                              </div>
                              <div className="text-xs text-gray-500">어시</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">기록 없음</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}