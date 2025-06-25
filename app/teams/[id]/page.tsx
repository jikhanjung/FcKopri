'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Team, Player } from '@/types'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  PlusIcon, 
  UserIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'
import SearchInput from '@/components/SearchInput'
import FilterDropdown from '@/components/FilterDropdown'
import TeamPhotos from '@/components/TeamPhotos'
import CommentSection from '@/components/CommentSection'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Match {
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

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [positionFilter, setPositionFilter] = useState('')

  useEffect(() => {
    async function fetchTeamData() {
      try {
        // 팀 정보 가져오기
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single()

        if (teamError) throw teamError
        setTeam(teamData)

        // 선수 정보 가져오기
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', teamId)
          .order('jersey_number', { ascending: true })

        if (playersError) throw playersError
        const playersArray = playersData || []
        setPlayers(playersArray)
        setFilteredPlayers(playersArray)

        // 팀의 경기 정보 가져오기
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(id, name),
            away_team:teams!matches_away_team_id_fkey(id, name)
          `)
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .order('match_date', { ascending: true })

        if (matchesError) throw matchesError
        setMatches(matchesData || [])
      } catch (error) {
        console.error('Error fetching team data:', error)
        router.push('/teams')
      } finally {
        setLoading(false)
      }
    }

    if (teamId) {
      fetchTeamData()
    }
  }, [teamId, router])

  // 선수 필터링
  useEffect(() => {
    let filtered = players

    // 이름 검색
    if (searchTerm.trim()) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 부서 필터
    if (departmentFilter) {
      filtered = filtered.filter(player => player.department === departmentFilter)
    }

    // 포지션 필터
    if (positionFilter) {
      filtered = filtered.filter(player => player.position === positionFilter)
    }

    setFilteredPlayers(filtered)
  }, [searchTerm, departmentFilter, positionFilter, players])

  // 고유 부서 목록
  const departments = Array.from(new Set(players.map(p => p.department).filter(Boolean))) as string[]
  // 고유 포지션 목록
  const positions = Array.from(new Set(players.map(p => p.position).filter(Boolean))) as string[]

  async function deletePlayer(playerId: string) {
    if (!confirm('정말로 이 선수를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)

      if (error) throw error

      const updatedPlayers = players.filter(player => player.id !== playerId)
      setPlayers(updatedPlayers)
      setFilteredPlayers(updatedPlayers.filter(player => {
        const matchesSearch = !searchTerm.trim() || player.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDepartment = !departmentFilter || player.department === departmentFilter
        const matchesPosition = !positionFilter || player.position === positionFilter
        return matchesSearch && matchesDepartment && matchesPosition
      }))
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('선수 삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">팀을 찾을 수 없습니다</h1>
          <Link href="/teams" className="text-kopri-blue hover:underline">
            팀 목록으로 돌아가기
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
              href="/teams"
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center">
              {team.logo_url && (
                <img
                  src={team.logo_url}
                  alt={`${team.name} 로고`}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                <p className="text-gray-600">
                  등록일: {new Date(team.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
          <AdminOnly>
            <Link
              href={`/teams/${team.id}/edit`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              수정
            </Link>
          </AdminOnly>
        </div>

        {/* 선수 목록 섹션 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">선수 명단</h2>
                <p className="text-gray-600">
                  총 {players.length}명 
                  {(searchTerm || departmentFilter || positionFilter) && 
                    ` | 검색 결과: ${filteredPlayers.length}명`
                  }
                </p>
              </div>
              <AdminOnly>
                <Link
                  href={`/teams/${team.id}/players/new`}
                  className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90 flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  선수 추가
                </Link>
              </AdminOnly>
            </div>

            {/* 검색 및 필터 */}
            {players.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="선수 이름 검색..."
                />
                <FilterDropdown
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  options={departments.map(dept => ({ value: dept, label: dept }))}
                  placeholder="모든 부서"
                />
                <FilterDropdown
                  value={positionFilter}
                  onChange={setPositionFilter}
                  options={positions.map(pos => ({ value: pos, label: pos }))}
                  placeholder="모든 포지션"
                />
              </div>
            )}
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 선수가 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 선수를 추가해보세요!</p>
              <AdminOnly>
                <Link
                  href={`/teams/${team.id}/players/new`}
                  className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90 inline-flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  선수 추가
                </Link>
              </AdminOnly>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600 mb-4">다른 검색어나 필터를 시도해보세요</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setDepartmentFilter('')
                  setPositionFilter('')
                }}
                className="text-kopri-blue hover:text-kopri-blue/80 text-sm"
              >
                모든 필터 초기화
              </button>
            </div>
          ) : (
            <>
              {/* 모바일 카드 뷰 (768px 미만) */}
              <div className="md:hidden space-y-4 p-4">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-kopri-blue text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {player.jersey_number || '?'}
                        </div>
                        <div>
                          <Link 
                            href={`/players/${player.id}`}
                            className="font-medium text-gray-900 hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
                          >
                            {player.name}
                          </Link>
                          <div className="text-sm text-gray-600">{player.position || '포지션 미정'}</div>
                        </div>
                      </div>
                      <AdminOnly>
                        <div className="flex space-x-3">
                          <Link
                            href={`/teams/${team.id}/players/${player.id}/edit`}
                            className="p-3 text-kopri-blue hover:text-kopri-blue/80 hover:bg-blue-50 rounded-full"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => deletePlayer(player.id)}
                            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </AdminOnly>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">부서:</span> {player.department || '부서 미정'}
                    </div>
                  </div>
                ))}
              </div>

              {/* 데스크톱 테이블 뷰 (768px 이상) */}
              <div className="hidden md:block overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      등번
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      포지션
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소속 부서
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-kopri-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {player.jersey_number || '?'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/players/${player.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{player.position || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{player.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <AdminOnly>
                          <div className="flex justify-end space-x-3">
                            <Link
                              href={`/teams/${team.id}/players/${player.id}/edit`}
                              className="p-2 text-kopri-blue hover:text-kopri-blue/80 hover:bg-blue-50 rounded-full"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => deletePlayer(player.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </AdminOnly>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* 팀 통계 */}
        {players.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">팀 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">{players.length}</div>
                <div className="text-sm text-gray-600">총 선수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {departments.length}
                </div>
                <div className="text-sm text-gray-600">참여 부서</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {players.filter(p => p.position).length}
                </div>
                <div className="text-sm text-gray-600">포지션 설정</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {players.filter(p => p.jersey_number).length}
                </div>
                <div className="text-sm text-gray-600">등번 설정</div>
              </div>
            </div>
            
            {/* 부서별 통계 */}
            {departments.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">부서별 선수 현황</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {departments.map(dept => (
                    <div key={dept} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-kopri-blue">
                        {players.filter(p => p.department === dept).length}
                      </div>
                      <div className="text-xs text-gray-600 truncate" title={dept}>
                        {dept}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 경기 일정 및 결과 */}
        {matches.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">경기 일정 및 결과</h3>
              <p className="text-gray-600">총 {matches.length}경기</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {matches.map((match) => {
                  const isHomeTeam = match.home_team_id === teamId
                  const teamScore = isHomeTeam ? match.home_score : match.away_score
                  const opponentScore = isHomeTeam ? match.away_score : match.home_score
                  const opponent = isHomeTeam ? match.away_team : match.home_team
                  
                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {match.status === 'completed' && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                teamScore !== null && opponentScore !== null
                                  ? teamScore > opponentScore
                                    ? 'bg-green-100 text-green-800'
                                    : teamScore < opponentScore
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {teamScore !== null && opponentScore !== null
                                  ? teamScore > opponentScore
                                    ? '승'
                                    : teamScore < opponentScore
                                    ? '패'
                                    : '무'
                                  : '-'
                                }
                              </span>
                            )}
                            {match.status === 'scheduled' && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                예정
                              </span>
                            )}
                            {match.status === 'in_progress' && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                진행중
                              </span>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {isHomeTeam ? '홈' : '원정'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              vs {opponent?.name || '미정'}
                            </span>
                            {match.status === 'completed' && teamScore !== null && opponentScore !== null && (
                              <span className="text-lg font-bold text-kopri-blue dark:text-kopri-lightblue">
                                {teamScore} - {opponentScore}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {match.match_date && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center justify-end mb-1">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {format(new Date(match.match_date), 'M월 d일 (EEE)', { locale: ko })}
                              </div>
                              <div className="flex items-center justify-end">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {format(new Date(match.match_date), 'HH:mm')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* 경기 통계 요약 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-kopri-blue dark:text-kopri-lightblue">
                      {matches.filter(m => m.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">경기</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {matches.filter(m => {
                        if (m.status !== 'completed') return false
                        const isHome = m.home_team_id === teamId
                        const teamScore = isHome ? m.home_score : m.away_score
                        const oppScore = isHome ? m.away_score : m.home_score
                        return teamScore !== null && oppScore !== null && teamScore > oppScore
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">승</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {matches.filter(m => {
                        if (m.status !== 'completed') return false
                        const isHome = m.home_team_id === teamId
                        const teamScore = isHome ? m.home_score : m.away_score
                        const oppScore = isHome ? m.away_score : m.home_score
                        return teamScore !== null && oppScore !== null && teamScore === oppScore
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">무</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {matches.filter(m => {
                        if (m.status !== 'completed') return false
                        const isHome = m.home_team_id === teamId
                        const teamScore = isHome ? m.home_score : m.away_score
                        const oppScore = isHome ? m.away_score : m.home_score
                        return teamScore !== null && oppScore !== null && teamScore < oppScore
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">패</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 팀 사진 */}
        {team && (
          <div className="mt-8">
            <TeamPhotos teamId={team.id} teamName={team.name} />
          </div>
        )}

        {/* 댓글 섹션 */}
        {team && (
          <div className="mt-8">
            <CommentSection 
              targetType="team" 
              targetId={team.id} 
              title={`${team.name} 팀 댓글`}
            />
          </div>
        )}
      </div>
    </div>
  )
}