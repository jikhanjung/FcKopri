'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  PlusIcon,
  CalendarIcon,
  TrophyIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import AdminRoute, { AdminOnly } from '@/components/AdminRoute'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'

interface Competition {
  id: string
  name: string
  description?: string
  year?: number
  start_date?: string
  end_date?: string
  half_duration_minutes?: number
  created_at: string
  updated_at: string
}

function CompetitionsListPageContent() {
  const router = useRouter()
  const { isSuperAdmin } = useAuth()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching competitions:', error)
        return
      }
      
      setCompetitions(data || [])
    } catch (error) {
      console.error('Error loading competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCompetition = async (competition: Competition) => {
    if (!isSuperAdmin) {
      alert('SuperAdmin만 대회를 삭제할 수 있습니다.')
      return
    }

    if (!confirm(`"${competition.name}" 대회를 삭제하시겠습니까?\n\n⚠️ 경고: 이 작업은 되돌릴 수 없으며, 관련된 모든 데이터(팀, 경기, 예측 등)가 함께 삭제됩니다.`)) {
      return
    }

    setDeleting(competition.id)
    try {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', competition.id)

      if (error) {
        console.error('Error deleting competition:', error)
        alert('대회 삭제 중 오류가 발생했습니다.')
        return
      }

      alert('대회가 삭제되었습니다.')
      loadCompetitions()
    } catch (error) {
      console.error('Error deleting competition:', error)
      alert('대회 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const createNewCompetition = () => {
    router.push('/admin/competition')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
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
    <AdminOnly>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">대회 관리</h1>
                <p className="text-gray-600 mt-2">
                  전체 대회 목록을 확인하고 관리합니다
                </p>
              </div>
            </div>
            <button
              onClick={createNewCompetition}
              className="flex items-center px-4 py-2 bg-kopri-blue text-white rounded-lg hover:bg-kopri-blue/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              새 대회 생성
            </button>
          </div>

          {/* 대회 목록 */}
          {competitions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                등록된 대회가 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                첫 번째 대회를 생성하여 리그 관리를 시작해보세요.
              </p>
              <button
                onClick={createNewCompetition}
                className="bg-kopri-blue text-white px-6 py-3 rounded-lg hover:bg-kopri-blue/90 transition-colors"
              >
                <PlusIcon className="w-5 h-5 inline mr-2" />
                새 대회 생성
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {competitions.map((competition) => (
                <div
                  key={competition.id}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <TrophyIcon className="w-6 h-6 text-kopri-blue mr-3" />
                          <h3 className="text-xl font-bold text-gray-900">
                            {competition.name}
                          </h3>
                          {competition.year && (
                            <span className="ml-3 bg-kopri-blue text-white text-sm px-2 py-1 rounded">
                              {competition.year}
                            </span>
                          )}
                        </div>
                        
                        {competition.description && (
                          <p className="text-gray-600 mb-4">
                            {competition.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          {(competition.start_date || competition.end_date) && (
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              <span>
                                {competition.start_date && competition.end_date ? (
                                  <>
                                    {format(parseISO(competition.start_date), 'M/d', { locale: ko })} ~ {format(parseISO(competition.end_date), 'M/d', { locale: ko })}
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({Math.ceil((new Date(competition.end_date).getTime() - new Date(competition.start_date).getTime()) / (1000 * 60 * 60 * 24) + 1)}일간)
                                    </span>
                                  </>
                                ) : competition.start_date ? (
                                  format(parseISO(competition.start_date), 'yyyy년 M월 d일', { locale: ko })
                                ) : competition.end_date ? (
                                  `~ ${format(parseISO(competition.end_date), 'yyyy년 M월 d일', { locale: ko })}`
                                ) : (
                                  '기간 미설정'
                                )}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <span className="text-gray-500">전반 시간:</span>
                            <span className="ml-2">
                              {competition.half_duration_minutes || 45}분
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-500">생성일:</span>
                            <span className="ml-2">
                              {format(new Date(competition.created_at), 'yyyy.M.d', { locale: ko })}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-500">수정일:</span>
                            <span className="ml-2">
                              {format(new Date(competition.updated_at), 'yyyy.M.d', { locale: ko })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/admin/competition?id=${competition.id}`}
                          className="p-2 text-gray-500 hover:text-kopri-blue transition-colors"
                          title="대회 보기/편집"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        
                        {isSuperAdmin && (
                          <button
                            onClick={() => deleteCompetition(competition)}
                            disabled={deleting === competition.id}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="대회 삭제 (SuperAdmin만)"
                          >
                            {deleting === competition.id ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <TrashIcon className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminOnly>
  )
}

export default function CompetitionsListPage() {
  return (
    <AdminRoute requiredRole="admin">
      <CompetitionsListPageContent />
    </AdminRoute>
  )
}