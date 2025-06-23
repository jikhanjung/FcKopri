'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Team } from '@/types'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import AdminRoute from '@/components/AdminRoute'

export default function NewMatchPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [formData, setFormData] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    match_time: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setTeams(data || [])
      } catch (error) {
        console.error('Error fetching teams:', error)
      }
    }

    fetchTeams()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.home_team_id || !formData.away_team_id) {
      alert('홈팀과 원정팀을 선택해주세요.')
      return
    }

    if (formData.home_team_id === formData.away_team_id) {
      alert('홈팀과 원정팀은 서로 달라야 합니다.')
      return
    }

    setLoading(true)
    try {
      // 대회 ID 가져오기
      const { data: competition } = await supabase
        .from('competitions')
        .select('id')
        .single()

      if (!competition) {
        throw new Error('대회를 찾을 수 없습니다.')
      }

      // 날짜와 시간 합치기
      let matchDateTime = null
      if (formData.match_date && formData.match_time) {
        matchDateTime = `${formData.match_date}T${formData.match_time}:00`
      }

      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            competition_id: competition.id,
            home_team_id: formData.home_team_id,
            away_team_id: formData.away_team_id,
            match_date: matchDateTime,
            status: 'scheduled'
          }
        ])
        .select()
        .single()

      if (error) throw error

      router.push(`/matches/${data.id}`)
    } catch (error: any) {
      console.error('Error creating match:', error)
      alert(error.message || '경기 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminRoute>
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <Link
            href="/matches"
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">새 경기 추가</h1>
            <p className="text-gray-600 mt-2">제 1회 KOPRI CUP 경기를 추가합니다</p>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 홈팀 */}
            <div>
              <label htmlFor="home_team_id" className="block text-sm font-medium text-gray-700 mb-2">
                홈팀 *
              </label>
              <select
                id="home_team_id"
                value={formData.home_team_id}
                onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                required
              >
                <option value="">홈팀 선택</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* 원정팀 */}
            <div>
              <label htmlFor="away_team_id" className="block text-sm font-medium text-gray-700 mb-2">
                원정팀 *
              </label>
              <select
                id="away_team_id"
                value={formData.away_team_id}
                onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                required
              >
                <option value="">원정팀 선택</option>
                {teams.filter(team => team.id !== formData.home_team_id).map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* 경기 날짜 */}
            <div>
              <label htmlFor="match_date" className="block text-sm font-medium text-gray-700 mb-2">
                경기 날짜 (선택)
              </label>
              <input
                type="date"
                id="match_date"
                value={formData.match_date}
                onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
              />
            </div>

            {/* 경기 시간 */}
            <div>
              <label htmlFor="match_time" className="block text-sm font-medium text-gray-700 mb-2">
                경기 시간 (선택)
              </label>
              <input
                type="time"
                id="match_time"
                value={formData.match_time}
                onChange={(e) => setFormData({ ...formData, match_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
              />
            </div>

            {/* 경기 미리보기 */}
            {formData.home_team_id && formData.away_team_id && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">경기 미리보기</h3>
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {teams.find(t => t.id === formData.home_team_id)?.name}
                    </div>
                    <div className="text-sm text-gray-600">홈</div>
                  </div>
                  <div className="text-gray-400 font-bold">VS</div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {teams.find(t => t.id === formData.away_team_id)?.name}
                    </div>
                    <div className="text-sm text-gray-600">원정</div>
                  </div>
                </div>
                {formData.match_date && (
                  <div className="text-center mt-3 text-sm text-gray-600">
                    {new Date(formData.match_date).toLocaleDateString('ko-KR')}
                    {formData.match_time && ` ${formData.match_time}`}
                  </div>
                )}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/matches"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading || teams.length < 2}
                className="px-6 py-2 bg-kopri-blue text-white rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '추가 중...' : '경기 추가'}
              </button>
            </div>
          </form>
        </div>

        {/* 도움말 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 팁</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 최소 2개의 팀이 등록되어야 경기를 추가할 수 있습니다</li>
            <li>• 날짜와 시간은 나중에 수정할 수 있습니다</li>
            <li>• 경기 결과는 경기 상세 페이지에서 입력할 수 있습니다</li>
          </ul>
        </div>
      </div>
      </div>
    </AdminRoute>
  )
}