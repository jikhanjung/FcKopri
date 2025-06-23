'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Team, Player } from '@/types'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import AdminRoute from '@/components/AdminRoute'

const positions = [
  'GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'
]

export default function EditPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const playerId = params.playerId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    jersey_number: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [usedNumbers, setUsedNumbers] = useState<number[]>([])

  useEffect(() => {
    async function fetchData() {
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
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single()

        if (playerError) throw playerError
        setPlayer(playerData)
        setFormData({
          name: playerData.name,
          position: playerData.position || '',
          jersey_number: playerData.jersey_number?.toString() || '',
          department: playerData.department || ''
        })

        // 사용 중인 등번 가져오기 (현재 선수 제외)
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('jersey_number')
          .eq('team_id', teamId)
          .neq('id', playerId)
          .not('jersey_number', 'is', null)

        if (playersError) throw playersError
        setUsedNumbers(playersData.map(p => p.jersey_number).filter(Boolean))
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push(`/teams/${teamId}`)
      }
    }

    if (teamId && playerId) {
      fetchData()
    }
  }, [teamId, playerId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('선수 이름을 입력해주세요.')
      return
    }

    const jerseyNumber = formData.jersey_number ? parseInt(formData.jersey_number) : null
    if (jerseyNumber && usedNumbers.includes(jerseyNumber)) {
      alert('이미 사용 중인 등번입니다.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('players')
        .update({
          name: formData.name.trim(),
          position: formData.position || null,
          jersey_number: jerseyNumber,
          department: formData.department || null
        })
        .eq('id', playerId)

      if (error) throw error

      router.push(`/teams/${teamId}`)
    } catch (error: any) {
      console.error('Error updating player:', error)
      alert(error.message || '선수 정보 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!team || !player) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <Link
            href={`/teams/${teamId}`}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">선수 정보 수정</h1>
            <p className="text-gray-600 mt-2">{team.name} - {player.name}</p>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 선수 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                선수 이름 *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                placeholder="예: 홍길동"
                required
              />
            </div>

            {/* 포지션 */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                포지션 (선택)
              </label>
              <select
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
              >
                <option value="">포지션 선택</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* 등번 */}
            <div>
              <label htmlFor="jersey_number" className="block text-sm font-medium text-gray-700 mb-2">
                등번 (선택)
              </label>
              <input
                type="number"
                id="jersey_number"
                min="1"
                max="99"
                value={formData.jersey_number}
                onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                placeholder="1-99"
              />
              {usedNumbers.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  사용 중인 등번: {usedNumbers.sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>

            {/* 소속 부서 */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                소속 부서 (선택)
              </label>
              <input
                type="text"
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                placeholder="예: 생명과학, 빙하지권, 해양대기"
              />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href={`/teams/${teamId}`}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-kopri-blue text-white rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </AdminRoute>
  )
}