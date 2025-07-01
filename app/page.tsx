'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Competition } from '@/types'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  CalendarIcon, 
  TrophyIcon, 
  CogIcon,
  ChartBarIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import ChampionWidget from '@/components/ChampionWidget'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [stats, setStats] = useState({
    teams: 0,
    matches: 0,
    completedMatches: 0
  })
  const [checkingUserLeagues, setCheckingUserLeagues] = useState(true)

  useEffect(() => {
    async function checkUserLeaguesAndFetchData() {
      if (authLoading) return

      // 로그인하지 않은 경우 데이터만 가져오기
      if (!user) {
        await fetchData()
        setCheckingUserLeagues(false)
        return
      }

      // 로그인한 사용자의 경우 소속 리그 확인
      try {
        const { data: userCompetitions, error } = await supabase
          .from('user_competition_relations')
          .select('*')
          .eq('user_id', user.id)

        if (error) throw error

        // 소속된 리그가 없으면 리그 선택 페이지로 이동
        if (!userCompetitions || userCompetitions.length === 0) {
          router.push('/select-league')
          return
        }

        // 소속된 리그가 있으면 데이터 가져오기
        await fetchData()
      } catch (error) {
        console.error('사용자 리그 확인 오류:', error)
        await fetchData() // 오류가 있어도 기본 데이터는 표시
      } finally {
        setCheckingUserLeagues(false)
      }
    }

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
          supabase.from('teams').select('id', { count: 'exact' }).neq('is_hidden', true),
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

    checkUserLeaguesAndFetchData()
  }, [user, authLoading, router])

  // 로딩 중일 때 표시
  if (authLoading || checkingUserLeagues) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 LeagueHub 랜딩 페이지 표시
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* 히어로 섹션 */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              {/* 메인 타이틀 */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-kopri-blue to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <TrophyIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
                  <span className="bg-gradient-to-r from-kopri-blue to-indigo-600 bg-clip-text text-transparent">
                    LeagueHub
                  </span>
                </h1>
                <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-4 font-light">
                  축구 리그 운영 관리 시스템
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  팀 관리부터 실시간 경기 진행, 통계 분석까지<br />
                  모든 축구 리그 운영을 한 곳에서 완벽하게 관리하세요
                </p>
              </div>

              {/* CTA 버튼 */}
              <div className="mb-16">
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-kopri-blue to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  시작하기
                </Link>
              </div>
            </div>
          </div>

          {/* 장식적 요소 */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-kopri-blue/10 rounded-full"></div>
            <div className="absolute top-40 right-16 w-16 h-16 bg-indigo-400/10 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-400/10 rounded-full"></div>
          </div>
        </div>

        {/* 기능 소개 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              강력한 기능들
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              현대적인 축구 리그 관리에 필요한 모든 기능을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 실시간 경기 관리 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-6">
                <PlayIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                실시간 경기 관리
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                골, 어시스트, 경고 등 경기 이벤트를 실시간으로 기록하고 관리할 수 있습니다.
              </p>
            </div>

            {/* 자동 순위 계산 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-6">
                <TrophyIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                자동 순위 계산
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                승점, 득실차, 다득점을 기준으로 실시간 순위표가 자동으로 업데이트됩니다.
              </p>
            </div>

            {/* 통계 및 분석 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-6">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                통계 및 분석
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                팀별, 선수별 상세 통계와 시각적 차트로 성과를 분석할 수 있습니다.
              </p>
            </div>

            {/* 예측 시스템 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center mb-6">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                예측 및 투표
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                경기 결과 예측, 우승팀 투표, MVP 선정 등 다양한 참여형 기능을 제공합니다.
              </p>
            </div>

            {/* 팀 관리 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mb-6">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                팀 및 선수 관리
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                팀 정보, 선수 등록, 로스터 관리 등을 체계적으로 관리할 수 있습니다.
              </p>
            </div>

            {/* 관리 시스템 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg flex items-center justify-center mb-6">
                <CogIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                권한 기반 관리
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                역할별 권한 시스템으로 안전하고 체계적인 리그 운영이 가능합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>© 2025 LeagueHub. 축구 리그 운영을 더 쉽게, 더 스마트하게.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로그인한 경우 기존 대시보드 표시
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
          <Link href="/teams" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid="teams-stat-card">
            <UserGroupIcon className="w-12 h-12 text-kopri-blue dark:text-kopri-lightblue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.teams}</h3>
            <p className="text-gray-600 dark:text-gray-300">참가 팀</p>
          </Link>
          <Link href="/matches" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid="matches-stat-card">
            <CalendarIcon className="w-12 h-12 text-kopri-blue dark:text-kopri-lightblue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.matches}</h3>
            <p className="text-gray-600 dark:text-gray-300">전체 경기</p>
          </Link>
          <Link href="/standings" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid="standings-stat-card">
            <TrophyIcon className="w-12 h-12 text-kopri-blue dark:text-kopri-lightblue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedMatches}</h3>
            <p className="text-gray-600 dark:text-gray-300">완료된 경기</p>
          </Link>
        </div>

        {/* 위젯 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChampionWidget />
          
          <Link href="/predictions" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow" data-testid="predictions-widget">
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