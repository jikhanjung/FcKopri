'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Competition } from '@/types'
import Link from 'next/link'
import { UserGroupIcon, CalendarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import ChampionWidget from '@/components/ChampionWidget'

export default function Home() {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [stats, setStats] = useState({
    teams: 0,
    matches: 0,
    completedMatches: 0
  })

  useEffect(() => {
    async function fetchData() {
      // 대회 정보 가져오기
      const { data: competitionData } = await supabase
        .from('competitions')
        .select('*')
        .single()

      if (competitionData) {
        setCompetition(competitionData)

        // 통계 데이터 가져오기
        const [teamsResult, matchesResult, completedResult] = await Promise.all([
          supabase.from('teams').select('id', { count: 'exact' }),
          supabase.from('matches').select('id', { count: 'exact' }),
          supabase.from('matches').select('id', { count: 'exact' }).eq('status', 'completed')
        ])

        setStats({
          teams: teamsResult.count || 0,
          matches: matchesResult.count || 0,
          completedMatches: completedResult.count || 0
        })
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-kopri-blue dark:text-kopri-lightblue mb-4">
            {competition?.name || '제 1회 KOPRI CUP'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {competition?.description || '한국극지연구소 풋살 대회'}
          </p>
          {competition && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {new Date(competition.start_date || '').toLocaleDateString('ko-KR')} - {' '}
              {new Date(competition.end_date || '').toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/teams" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <UserGroupIcon className="w-12 h-12 text-kopri-blue dark:text-kopri-lightblue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.teams}</h3>
            <p className="text-gray-600 dark:text-gray-300">참가 팀</p>
          </Link>
          <Link href="/matches" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CalendarIcon className="w-12 h-12 text-kopri-blue dark:text-kopri-lightblue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.matches}</h3>
            <p className="text-gray-600 dark:text-gray-300">전체 경기</p>
          </Link>
          <Link href="/standings" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <TrophyIcon className="w-12 h-12 text-kopri-blue dark:text-kopri-lightblue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedMatches}</h3>
            <p className="text-gray-600 dark:text-gray-300">완료된 경기</p>
          </Link>
        </div>

        {/* 위젯 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChampionWidget />
          
          <Link href="/predictions" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-kopri-blue/10 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">⚽</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">경기 결과 맞히기</h3>
                <p className="text-gray-600 dark:text-gray-300">다가오는 경기 결과를 예측해보세요</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/teams" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-kopri-blue dark:text-kopri-lightblue mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">팀 관리</h3>
                <p className="text-gray-600 dark:text-gray-300">팀과 선수 정보를 관리합니다</p>
              </div>
            </div>
          </Link>
          
          <Link href="/matches" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-kopri-blue dark:text-kopri-lightblue mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">경기 일정</h3>
                <p className="text-gray-600 dark:text-gray-300">경기 일정과 결과를 확인합니다</p>
              </div>
            </div>
          </Link>
          
          <Link href="/standings" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <TrophyIcon className="w-8 h-8 text-kopri-blue dark:text-kopri-lightblue mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">순위표</h3>
                <p className="text-gray-600 dark:text-gray-300">현재 리그 순위를 확인합니다</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}