'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Team } from '@/types'
import Link from 'next/link'
import { PlusIcon, UserGroupIcon, PencilIcon } from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'
import SearchInput from '@/components/SearchInput'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error
        const teamsData = data || []
        setTeams(teamsData)
        setFilteredTeams(teamsData)
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  // 검색 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTeams(teams)
    } else {
      const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTeams(filtered)
    }
  }, [searchTerm, teams])

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">참가 팀</h1>
            <p className="text-gray-600 mt-2">제 1회 KOPRI CUP에 참가하는 팀들입니다</p>
          </div>
          <AdminOnly>
            <Link
              href="/teams/new"
              className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90 flex items-center ml-4"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              팀 추가
            </Link>
          </AdminOnly>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="팀 이름으로 검색..."
            className="max-w-md"
          />
        </div>

        {/* 검색 결과 */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            "{searchTerm}"에 대한 검색 결과: {filteredTeams.length}개 팀
          </div>
        )}

        {/* 팀이 없는 경우 */}
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">아직 등록된 팀이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 팀을 추가해보세요!</p>
            <AdminOnly>
              <Link
                href="/teams/new"
                className="bg-kopri-blue text-white px-6 py-3 rounded-md hover:bg-kopri-blue/90 inline-flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                팀 추가하기
              </Link>
            </AdminOnly>
          </div>
        ) : filteredTeams.length === 0 ? (
          /* 검색 결과가 없는 경우 */
          <div className="text-center py-12">
            <UserGroupIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 검색어를 시도해보세요</p>
          </div>
        ) : (
          /* 팀 목록 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 relative"
              >
                {/* 어드민 전용 빠른 수정 버튼 */}
                <AdminOnly>
                  <Link
                    href={`/teams/${team.id}/edit`}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-kopri-blue hover:bg-gray-100 rounded-full z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                </AdminOnly>

                <Link
                  href={`/teams/${team.id}`}
                  className="block p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>
                      <div className="flex items-center text-gray-600">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">팀 정보 보기</span>
                      </div>
                    </div>
                    {team.logo_url && (
                      <img
                        src={team.logo_url}
                        alt={`${team.name} 로고`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      등록일: {new Date(team.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* 통계 */}
        {teams.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">팀 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {searchTerm ? filteredTeams.length : teams.length}
                </div>
                <div className="text-sm text-gray-600">
                  {searchTerm ? '검색된 팀' : '총 참가 팀'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {(searchTerm ? filteredTeams : teams).filter(team => team.logo_url).length}
                </div>
                <div className="text-sm text-gray-600">로고 등록 팀</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kopri-blue">
                  {Math.round((teams.length * (teams.length - 1)) / 2)}
                </div>
                <div className="text-sm text-gray-600">예상 경기 수</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}