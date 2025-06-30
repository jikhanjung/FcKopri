'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Team } from '@/types'
import Link from 'next/link'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline'
import AdminRoute from '@/components/AdminRoute'
import { moveTeamPlayersToUnassignedTeam } from '@/lib/unassigned-team-utils'

export default function EditTeamPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    logo_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function fetchTeam() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single()

        if (error) throw error
        
        setTeam(data)
        setFormData({
          name: data.name,
          logo_url: data.logo_url || ''
        })
      } catch (error) {
        console.error('Error fetching team:', error)
        router.push('/teams')
      }
    }

    if (teamId) {
      fetchTeam()
    }
  }, [teamId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('팀 이름을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: formData.name.trim(),
          logo_url: formData.logo_url.trim() || null
        })
        .eq('id', teamId)

      if (error) throw error

      router.push(`/teams/${teamId}`)
    } catch (error: any) {
      console.error('Error updating team:', error)
      alert(error.message || '팀 정보 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!team) return

    const confirmMessage = `"${team.name}" 팀을 정말로 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 다음과 같이 처리됩니다:\n- 팀 정보 삭제\n- 소속 선수들은 무소속 팀으로 이동\n- 관련된 모든 경기 삭제\n\n계속하려면 팀 이름을 입력해주세요.`
    
    const userInput = prompt(confirmMessage)
    if (userInput !== team.name) {
      if (userInput !== null) {
        alert('팀 이름이 일치하지 않습니다.')
      }
      return
    }

    setDeleteLoading(true)
    try {
      // 먼저 팀 소속 선수들을 무소속 팀으로 이동
      const playersMovedSuccessfully = await moveTeamPlayersToUnassignedTeam(teamId)
      
      if (!playersMovedSuccessfully) {
        alert('선수 이동 중 오류가 발생했습니다. 관리자에게 문의하세요.')
        return
      }

      // 팀 삭제 (경기는 CASCADE로 자동 삭제)
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      alert('팀이 성공적으로 삭제되었습니다.\n소속 선수들은 무소속 팀으로 이동되었습니다.')
      router.push('/teams')
    } catch (error: any) {
      console.error('Error deleting team:', error)
      alert(error.message || '팀 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!team) {
    return (
      <AdminRoute>
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
      </AdminRoute>
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
              <h1 className="text-3xl font-bold text-gray-900">팀 정보 수정</h1>
              <p className="text-gray-600 mt-2">{team.name}</p>
            </div>
          </div>

          {/* 수정 폼 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 팀 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  팀 이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                  placeholder="예: 극지연구소 FC"
                  required
                />
              </div>

              {/* 로고 URL */}
              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                  로고 URL (선택)
                </label>
                <input
                  type="url"
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-gray-500 mt-1">
                  팀 로고 이미지의 URL을 입력하세요.
                </p>
              </div>

              {/* 로고 미리보기 */}
              {formData.logo_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    로고 미리보기
                  </label>
                  <div className="flex items-center space-x-4">
                    <img
                      src={formData.logo_url}
                      alt="로고 미리보기"
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      원형으로 표시됩니다
                    </p>
                  </div>
                </div>
              )}

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

          {/* 위험 구역 - 팀 삭제 */}
          <div className="bg-white rounded-lg shadow border border-red-200">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900">위험 구역</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">팀 삭제</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    팀을 삭제하면 소속 선수들은 무소속 팀으로 이동되고, 관련된 모든 경기 데이터가 삭제됩니다. 
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="text-xs text-red-600 space-y-1">
                    <p>• 팀 정보 삭제</p>
                    <p>• 소속 선수들 무소속 팀으로 이동</p>
                    <p>• 관련된 모든 경기 삭제</p>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {deleteLoading ? '삭제 중...' : '팀 삭제'}
                </button>
              </div>
            </div>
          </div>

          {/* 도움말 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 팁</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 로고는 정사각형 이미지를 권장합니다</li>
              <li>• 팀 이름 변경 시 모든 관련 데이터에 자동으로 반영됩니다</li>
              <li>• 팀 삭제는 신중하게 결정하시기 바랍니다</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}