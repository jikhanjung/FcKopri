'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrophyIcon, FireIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'
import { updatePlayoffMatches, isLeagueCompleted } from '@/lib/playoff-utils'

interface TeamStanding {
  team_id: string
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export default function TeamsStandingsPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [playoffLoading, setPlayoffLoading] = useState(false)
  const [leagueCompleted, setLeagueCompleted] = useState(false)

  useEffect(() => {
    async function calculateStandings() {
      try {
        // 모든 팀과 완료된 경기 가져오기
        const [teamsResult, matchesResult] = await Promise.all([
          supabase.from('teams').select('id, name'),
          supabase
            .from('matches')
            .select('home_team_id, away_team_id, home_score, away_score')
            .eq('status', 'completed')
            .not('home_score', 'is', null)
            .not('away_score', 'is', null)
        ])

        if (teamsResult.error) throw teamsResult.error
        if (matchesResult.error) throw matchesResult.error

        const teams = teamsResult.data || []
        const matches = matchesResult.data || []

        // 각 팀의 통계 계산
        const teamStats = teams.map(team => {
          const stats: TeamStanding = {
            team_id: team.id,
            team_name: team.name,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0
          }

          // 홈경기 통계
          const homeMatches = matches.filter(match => match.home_team_id === team.id)
          homeMatches.forEach(match => {
            stats.played++
            stats.goals_for += match.home_score!
            stats.goals_against += match.away_score!

            if (match.home_score! > match.away_score!) {
              stats.won++
              stats.points += 3
            } else if (match.home_score! === match.away_score!) {
              stats.drawn++
              stats.points += 1
            } else {
              stats.lost++
            }
          })

          // 원정경기 통계
          const awayMatches = matches.filter(match => match.away_team_id === team.id)
          awayMatches.forEach(match => {
            stats.played++
            stats.goals_for += match.away_score!
            stats.goals_against += match.home_score!

            if (match.away_score! > match.home_score!) {
              stats.won++
              stats.points += 3
            } else if (match.away_score! === match.home_score!) {
              stats.drawn++
              stats.points += 1
            } else {
              stats.lost++
            }
          })

          stats.goal_difference = stats.goals_for - stats.goals_against
          return stats
        })

        // 순위 정렬 (승점 > 골득실 > 다득점 순)
        teamStats.sort((a, b) => {
          if (a.points !== b.points) return b.points - a.points
          if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference
          return b.goals_for - a.goals_for
        })

        setStandings(teamStats)
        
        // 리그 완료 상태 확인
        const completed = await isLeagueCompleted()
        setLeagueCompleted(completed)
      } catch (error) {
        console.error('Error calculating standings:', error)
      } finally {
        setLoading(false)
      }
    }

    calculateStandings()
  }, [])

  async function handleUpdatePlayoffs() {
    if (!leagueCompleted) {
      alert('리그전이 아직 완료되지 않았습니다.')
      return
    }

    setPlayoffLoading(true)
    try {
      await updatePlayoffMatches()
      alert('플레이오프 경기가 성공적으로 업데이트되었습니다!')
    } catch (error: any) {
      console.error('Error updating playoffs:', error)
      alert(error.message || '플레이오프 업데이트 중 오류가 발생했습니다.')
    } finally {
      setPlayoffLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="w-5 h-5 text-yellow-500" />
    if (rank <= 3) return <FireIcon className="w-5 h-5 text-orange-500" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-800 dark:text-yellow-100'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-100'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-800 dark:text-orange-100'
    return 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <div className="p-6 space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">팀 순위</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">제 1회 KOPRI CUP 현재 팀 순위입니다</p>
          </div>
          
          {/* 플레이오프 업데이트 버튼 */}
          <AdminOnly>
            <div className="flex flex-col items-end space-y-2">
              {leagueCompleted && (
                <div className="text-sm text-green-600 font-medium">
                  ✅ 리그전 완료
                </div>
              )}
              <button
                onClick={handleUpdatePlayoffs}
                disabled={!leagueCompleted || playoffLoading}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  leagueCompleted
                    ? 'bg-kopri-blue text-white hover:bg-kopri-blue/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${playoffLoading ? 'animate-spin' : ''}`} />
                {playoffLoading ? '업데이트 중...' : '플레이오프 업데이트'}
              </button>
              {!leagueCompleted && (
                <p className="text-xs text-gray-500 text-right">
                  리그전 완료 후 사용 가능
                </p>
              )}
            </div>
          </AdminOnly>
        </div>

        {/* 순위표가 없는 경우 */}
        {standings.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">아직 순위 정보가 없습니다</h3>
            <p className="text-gray-600 dark:text-gray-400">팀을 추가하고 경기 결과를 입력하면 순위표가 표시됩니다</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="bg-kopri-blue text-white px-6 py-4">
              <h2 className="text-xl font-semibold">팀 순위표</h2>
              <p className="text-blue-100 text-sm mt-1 md:hidden">좌우로 스크롤하여 모든 정보를 확인하세요</p>
            </div>

            {/* 모바일 카드 뷰 (768px 미만) */}
            <div className="md:hidden">
              {standings.map((team, index) => {
                const rank = index + 1
                return (
                  <div key={team.team_id} className={`p-4 border-b border-gray-200 dark:border-gray-700 ${rank <= 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${getRankBadge(rank)}`}>
                          {rank}
                        </span>
                        {getRankIcon(rank)}
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{team.team_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-kopri-blue text-white">
                          {team.points}점
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{team.won}</div>
                        <div className="text-gray-500 dark:text-gray-400">승</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{team.drawn}</div>
                        <div className="text-gray-500 dark:text-gray-400">무</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{team.lost}</div>
                        <div className="text-gray-500 dark:text-gray-400">패</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{team.goals_for}</div>
                        <div className="text-gray-500 dark:text-gray-400">득점</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{team.goals_against}</div>
                        <div className="text-gray-500 dark:text-gray-400">실점</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${team.goal_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">득실차</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 데스크톱 테이블 뷰 (768px 이상) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      순위
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      팀명
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      경기
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      승
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      무
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      패
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      득점
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      실점
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      득실차
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      승점
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {standings.map((team, index) => {
                    const rank = index + 1
                    return (
                      <tr key={team.team_id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${rank <= 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadge(rank)}`}>
                              {rank}
                            </span>
                            <div className="ml-2">
                              {getRankIcon(rank)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{team.team_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">
                          {team.played}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                          {team.won}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                          {team.drawn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                          {team.lost}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">
                          {team.goals_for}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">
                          {team.goals_against}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <span className={team.goal_difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-kopri-blue text-white">
                            {team.points}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 통계 요약 */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-kopri-blue dark:text-kopri-lightblue">{standings.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">참가 팀</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-kopri-blue dark:text-kopri-lightblue">
                    {standings.reduce((acc, team) => acc + team.played, 0) / 2}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">총 경기</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-kopri-blue dark:text-kopri-lightblue">
                    {standings.reduce((acc, team) => acc + team.goals_for, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">총 득점</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-kopri-blue dark:text-kopri-lightblue">
                    {standings.length > 0 ? (standings.reduce((acc, team) => acc + team.goals_for, 0) / (standings.reduce((acc, team) => acc + team.played, 0) / 2 || 1)).toFixed(1) : '0'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">경기당 득점</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 순위 결정 기준 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">📋 순위 결정 기준</h3>
          <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>승점 (승리 3점, 무승부 1점, 패배 0점)</li>
            <li>득실차 (득점 - 실점)</li>
            <li>다득점</li>
          </ol>
        </div>
      </div>
    </div>
  )
}