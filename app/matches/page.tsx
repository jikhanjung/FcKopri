'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { PlusIcon, CalendarIcon, ClockIcon, FireIcon, PlayIcon } from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import SearchInput from '@/components/SearchInput'
import FilterDropdown from '@/components/FilterDropdown'

interface MatchWithTeams {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  home_score: number | null
  away_score: number | null
  status: string
  youtube_url?: string
  youtube_title?: string
  created_at: string
  home_team: { name: string } | null
  away_team: { name: string } | null
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [filteredMatches, setFilteredMatches] = useState<MatchWithTeams[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    async function fetchMatches() {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name)
          `)
          .order('match_date', { ascending: true })

        if (error) throw error
        const matchesData = data || []
        setMatches(matchesData)
        setFilteredMatches(matchesData)
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  // 필터링 로직
  useEffect(() => {
    let filtered = matches

    // 팀 이름 검색
    if (searchTerm.trim()) {
      filtered = filtered.filter(match => {
        const homeTeam = match.home_team?.name || '미정'
        const awayTeam = match.away_team?.name || '미정'
        return (
          homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          awayTeam.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // 상태 필터
    if (statusFilter) {
      filtered = filtered.filter(match => match.status === statusFilter)
    }

    // 날짜 필터
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(match => {
        if (!match.match_date) return false
        const matchDate = new Date(match.match_date)
        return (
          matchDate.getFullYear() === filterDate.getFullYear() &&
          matchDate.getMonth() === filterDate.getMonth() &&
          matchDate.getDate() === filterDate.getDate()
        )
      })
    }

    setFilteredMatches(filtered)
  }, [searchTerm, statusFilter, dateFilter, matches])

  // 상태 옵션
  const statusOptions = [
    { value: 'scheduled', label: '예정' },
    { value: 'in_progress', label: '진행중' },
    { value: 'completed', label: '완료' },
    { value: 'cancelled', label: '취소' }
  ]

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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">경기 일정</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">제 1회 KOPRI CUP 경기 일정과 결과입니다</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/calendar"
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center text-sm sm:text-base"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              캘린더 보기
            </Link>
            <Link
              href="/playoffs"
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center text-sm sm:text-base"
            >
              <FireIcon className="w-5 h-5 mr-2" />
              플레이오프
            </Link>
            <AdminOnly>
              <Link
                href="/matches/new"
                className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90 flex items-center text-sm sm:text-base"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                경기 추가
              </Link>
            </AdminOnly>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="팀 이름으로 검색..."
            />
            <FilterDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="모든 상태"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
            />
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setDateFilter('')
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              초기화
            </button>
          </div>
          
          {/* 검색 결과 */}
          {(searchTerm || statusFilter || dateFilter) && (
            <div className="text-sm text-gray-600">
              검색 결과: {filteredMatches.length}개 경기
            </div>
          )}
        </div>

        {/* 경기가 없는 경우 */}
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">아직 등록된 경기가 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 경기를 추가해보세요!</p>
            <AdminOnly>
              <Link
                href="/matches/new"
                className="bg-kopri-blue text-white px-6 py-3 rounded-md hover:bg-kopri-blue/90 inline-flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                경기 추가하기
              </Link>
            </AdminOnly>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600 mb-4">다른 검색어나 필터를 시도해보세요</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setDateFilter('')
              }}
              className="text-kopri-blue hover:text-kopri-blue/80 text-sm"
            >
              모든 필터 초기화
            </button>
          </div>
        ) : (
          /* 경기 목록 */
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {match.match_date && (
                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {format(new Date(match.match_date), 'M월 d일 (EEE)', { locale: ko })}
                            </span>
                          </div>
                        )}
                        {match.match_date && (
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {format(new Date(match.match_date), 'HH:mm')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {match.youtube_url && (
                          <div className="flex items-center px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                            <PlayIcon className="w-3 h-3 mr-1" />
                            영상
                          </div>
                        )}
                        {getStatusBadge(match.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-8">
                      {/* 홈팀 */}
                      <div className="text-center flex-1">
                        <div className="text-lg font-semibold text-gray-900">
                          {match.home_team?.name || '미정'}
                        </div>
                        {match.status === 'completed' && (
                          <div className="text-2xl font-bold text-kopri-blue mt-2">
                            {match.home_score}
                          </div>
                        )}
                      </div>

                      {/* VS */}
                      <div className="text-gray-400 font-bold">VS</div>

                      {/* 원정팀 */}
                      <div className="text-center flex-1">
                        <div className="text-lg font-semibold text-gray-900">
                          {match.away_team?.name || '미정'}
                        </div>
                        {match.status === 'completed' && (
                          <div className="text-2xl font-bold text-kopri-blue mt-2">
                            {match.away_score}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 통계 */}
        {matches.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">경기 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">{matches.length}</div>
                <div className="text-sm text-gray-600">전체 경기</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {matches.filter(m => m.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-600">예정된 경기</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {matches.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">완료된 경기</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {matches.filter(m => m.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">진행 중인 경기</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}