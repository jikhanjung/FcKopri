'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import AdminRoute from '@/components/AdminRoute'

export default function NewTeamPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    logo_url: ''
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('팀 이름을 입력해주세요.')
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

      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            name: formData.name.trim(),
            logo_url: formData.logo_url.trim() || null,
            competition_id: competition.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      router.push(`/teams/${data.id}`)
    } catch (error: any) {
      console.error('Error creating team:', error)
      alert(error.message || '팀 생성 중 오류가 발생했습니다.')
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
            href="/teams"
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">새 팀 추가</h1>
            <p className="text-gray-600 mt-2">제 1회 KOPRI CUP에 참가할 팀을 추가합니다</p>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow p-6">
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
                팀 로고 이미지의 URL을 입력하세요. 나중에 수정할 수 있습니다.
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
                href="/teams"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-kopri-blue text-white rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '추가 중...' : '팀 추가'}
              </button>
            </div>
          </form>
        </div>

        {/* 도움말 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 팁</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 팀 이름은 나중에 수정할 수 있습니다</li>
            <li>• 로고는 정사각형 이미지를 권장합니다</li>
            <li>• 팀을 추가한 후 선수들을 등록할 수 있습니다</li>
          </ul>
        </div>
      </div>
      </div>
    </AdminRoute>
  )
}