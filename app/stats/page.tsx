'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TrophyIcon, 
  FireIcon, 
  ChartBarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface PlayerStats {
  player_id: string
  player_name: string
  team_name: string
  department: string
  goals: number
  assists: number
  matches_played: number
  avg_goals: number
}

interface TeamStats {
  team_id: string
  team_name: string
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  avg_goals_per_match: number
  avg_conceded_per_match: number
}

interface DepartmentStats {
  department: string
  player_count: number
  teams_represented: string[]
  total_goals: number
  avg_goals_per_player: number
}

export default function StatsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // 팀 통계 계산
        const teamStatsData = await calculateTeamStats()
        setTeamStats(teamStatsData)

        // 선수 통계 계산 (득점왕 등)
        const playerStatsData = await calculatePlayerStats(teamStatsData)
        setPlayerStats(playerStatsData)

        // 부서별 통계
        const deptStatsData = await calculateDepartmentStats()
        setDepartmentStats(deptStatsData)

      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  async function calculateTeamStats(): Promise<TeamStats[]> {
    const [teamsResult, matchesResult] = await Promise.all([
      supabase.from('teams').select('id, name'),
      supabase
        .from('matches')
        .select('home_team_id, away_team_id, home_score, away_score')
        .eq('status', 'completed')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null)
        .not('home_team_id', 'is', null)
        .not('away_team_id', 'is', null)
    ])

    if (teamsResult.error || matchesResult.error) {
      throw new Error('Failed to fetch team data')
    }

    const teams = teamsResult.data || []
    const matches = matchesResult.data || []

    return teams.map(team => {
      const stats: TeamStats = {
        team_id: team.id,
        team_name: team.name,
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
        avg_goals_per_match: 0,
        avg_conceded_per_match: 0
      }

      // 홈경기 통계
      const homeMatches = matches.filter(match => match.home_team_id === team.id)
      homeMatches.forEach(match => {
        stats.matches_played++
        stats.goals_for += match.home_score!
        stats.goals_against += match.away_score!

        if (match.home_score! > match.away_score!) {
          stats.wins++
          stats.points += 3
        } else if (match.home_score! === match.away_score!) {
          stats.draws++
          stats.points += 1
        } else {
          stats.losses++
        }
      })

      // 원정경기 통계
      const awayMatches = matches.filter(match => match.away_team_id === team.id)
      awayMatches.forEach(match => {
        stats.matches_played++
        stats.goals_for += match.away_score!
        stats.goals_against += match.home_score!

        if (match.away_score! > match.home_score!) {
          stats.wins++
          stats.points += 3
        } else if (match.away_score! === match.home_score!) {
          stats.draws++
          stats.points += 1
        } else {
          stats.losses++
        }
      })

      stats.goal_difference = stats.goals_for - stats.goals_against
      stats.avg_goals_per_match = stats.matches_played > 0 ? stats.goals_for / stats.matches_played : 0
      stats.avg_conceded_per_match = stats.matches_played > 0 ? stats.goals_against / stats.matches_played : 0

      return stats
    }).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference
      return b.goals_for - a.goals_for
    })
  }

  async function calculatePlayerStats(teamStats: TeamStats[]): Promise<PlayerStats[]> {
    const { data: players, error } = await supabase
      .from('players')
      .select('id, name, department, teams(id, name)')

    if (error || !players) return []

    // 실제 구현에서는 경기별 득점/어시스트 데이터가 필요합니다.
    // 현재는 팀 득점을 선수 수로 나눈 가상 데이터를 사용합니다.
    return players.map(player => {
      const teamStat = teamStats.find(t => t.team_id === (player.teams as any)?.id)
      const teamPlayerCount = players.filter(p => (p.teams as any)?.id === (player.teams as any)?.id).length
      
      // 가상 데이터 (실제로는 별도 테이블에서 가져와야 함)
      const estimatedGoals = teamStat ? Math.floor((teamStat.goals_for / teamPlayerCount) * (0.5 + Math.random() * 1.5)) : 0
      const estimatedAssists = Math.floor(estimatedGoals * (0.3 + Math.random() * 0.7))
      
      return {
        player_id: player.id,
        player_name: player.name,
        team_name: (player.teams as any)?.name || '팀 미정',
        department: player.department || '부서 미정',
        goals: estimatedGoals,
        assists: estimatedAssists,
        matches_played: teamStat?.matches_played || 0,
        avg_goals: teamStat?.matches_played ? estimatedGoals / teamStat.matches_played : 0
      }
    }).sort((a, b) => b.goals - a.goals)
  }

  async function calculateDepartmentStats(): Promise<DepartmentStats[]> {
    const { data: players, error } = await supabase
      .from('players')
      .select('department, teams(name)')

    if (error || !players) return []

    const deptMap = new Map<string, DepartmentStats>()

    players.forEach(player => {
      const dept = player.department || '부서 미정'
      const teamName = (player.teams as any)?.name || '팀 미정'

      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          department: dept,
          player_count: 0,
          teams_represented: [],
          total_goals: 0,
          avg_goals_per_player: 0
        })
      }

      const deptStat = deptMap.get(dept)!
      deptStat.player_count++
      
      if (!deptStat.teams_represented.includes(teamName)) {
        deptStat.teams_represented.push(teamName)
      }
    })

    return Array.from(deptMap.values())
      .sort((a, b) => b.player_count - a.player_count)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const topScorer = playerStats[0]
  const topAssister = playerStats.sort((a, b) => b.assists - a.assists)[0]
  const bestTeam = teamStats[0]

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="w-8 h-8 mr-3 text-kopri-blue" />
            통계 대시보드
          </h1>
          <p className="text-gray-600 mt-2">제 1회 KOPRI CUP 상세 통계 분석</p>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <TrophyIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-yellow-800">득점왕</div>
                <div className="text-lg font-bold text-yellow-900">
                  {topScorer ? `${topScorer.player_name} (${topScorer.goals}골)` : '-'}
                </div>
                <div className="text-xs text-yellow-700">
                  {topScorer?.team_name} · {topScorer?.department}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <FireIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-blue-800">도움왕</div>
                <div className="text-lg font-bold text-blue-900">
                  {topAssister ? `${topAssister.player_name} (${topAssister.assists}개)` : '-'}
                </div>
                <div className="text-xs text-blue-700">
                  {topAssister?.team_name} · {topAssister?.department}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <TrophyIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-green-800">1위 팀</div>
                <div className="text-lg font-bold text-green-900">
                  {bestTeam ? `${bestTeam.team_name} (${bestTeam.points}점)` : '-'}
                </div>
                <div className="text-xs text-green-700">
                  {bestTeam ? `${bestTeam.wins}승 ${bestTeam.draws}무 ${bestTeam.losses}패` : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-purple-800">참가 부서</div>
                <div className="text-lg font-bold text-purple-900">
                  {departmentStats.filter(d => d.department !== '부서 미정').length}개 부서
                </div>
                <div className="text-xs text-purple-700">
                  총 {playerStats.length}명 참가
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 통계 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 득점 순위 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrophyIcon className="w-5 h-5 mr-2 text-kopri-blue" />
                득점 순위 TOP 10
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {playerStats.slice(0, 10).map((player, index) => (
                  <div key={player.player_id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{player.player_name}</div>
                        <div className="text-sm text-gray-500">
                          {player.team_name} · {player.department}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-kopri-blue">{player.goals}</div>
                      <div className="text-xs text-gray-500">
                        {player.matches_played > 0 ? `평균 ${player.avg_goals.toFixed(1)}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 팀별 통계 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-kopri-blue" />
                팀별 상세 통계
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {teamStats.map((team, index) => (
                  <div key={team.team_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <h3 className="ml-2 font-semibold text-gray-900">{team.team_name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-kopri-blue">{team.points}점</div>
                        <div className="text-xs text-gray-500">
                          {team.wins}승 {team.draws}무 {team.losses}패
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{team.goals_for}</div>
                        <div className="text-gray-500">득점</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{team.goals_against}</div>
                        <div className="text-gray-500">실점</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${team.goal_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </div>
                        <div className="text-gray-500">득실차</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>평균 득점: {team.avg_goals_per_match.toFixed(1)}</div>
                      <div>평균 실점: {team.avg_conceded_per_match.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 부서별 참가 현황 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2 text-kopri-blue" />
              부서별 참가 현황
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentStats.filter(dept => dept.department !== '부서 미정').map((dept) => (
                <div key={dept.department} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{dept.department}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">참가 선수:</span>
                      <span className="font-medium">{dept.player_count}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">소속 팀:</span>
                      <span className="font-medium">{dept.teams_represented.length}개</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {dept.teams_represented.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}