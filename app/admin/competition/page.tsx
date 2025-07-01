'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  PencilIcon,
  CalendarIcon,
  TrophyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

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

export default function CompetitionEditPage() {
  const router = useRouter()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: '',
    start_date: '',
    end_date: '',
    half_duration_minutes: ''
  })

  useEffect(() => {
    async function fetchCompetition() {
      try {
        // 첫 번째 대회 정보 가져오기 (현재 시스템은 단일 대회만 지원)
        const { data, error } = await supabase
          .from('competitions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error('Error fetching competition:', error)
          return
        }
        
        setCompetition(data)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          year: data.year?.toString() || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          half_duration_minutes: data.half_duration_minutes?.toString() || '45'
        })
      } catch (error) {
        console.error('Error fetching competition:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetition()
  }, [])

  async function handleSave() {
    if (!competition) return

    setSaving(true)
    try {
      const updates: any = {
        name: formData.name,
        description: formData.description || null,
        year: formData.year ? parseInt(formData.year) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        half_duration_minutes: formData.half_duration_minutes ? parseInt(formData.half_duration_minutes) : 45,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('competitions')
        .update(updates)
        .eq('id', competition.id)

      if (error) throw error

      // 상태 업데이트
      setCompetition({
        ...competition,
        ...updates
      })
      setEditMode(false)
      
      alert('대회 정보가 업데이트되었습니다.')
    } catch (error) {
      console.error('Error updating competition:', error)
      alert('업데이트 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (!competition) return
    
    setFormData({
      name: competition.name || '',
      description: competition.description || '',
      year: competition.year?.toString() || '',
      start_date: competition.start_date || '',
      end_date: competition.end_date || '',
      half_duration_minutes: competition.half_duration_minutes?.toString() || '45'
    })
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
                <h1 className="text-3xl font-bold text-gray-900">대회 설정</h1>
                <p className="text-gray-600 mt-2">
                  대회 기본 정보를 관리합니다
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-kopri-blue text-white px-6 py-2 rounded-lg hover:bg-kopri-blue/90 flex items-center"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  편집
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>

          {competition && (
            <div className="bg-white rounded-lg shadow-lg">
              {/* 대회 정보 카드 */}
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <TrophyIcon className="w-8 h-8 text-kopri-blue mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">대회 정보</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 기본 정보 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        대회명
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                          placeholder="대회명을 입력하세요"
                        />
                      ) : (
                        <div className="text-xl font-semibold text-gray-900 py-2">
                          {competition.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        대회 연도
                      </label>
                      {editMode ? (
                        <input
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                          placeholder="예: 2024"
                          min="2020"
                          max="2030"
                        />
                      ) : (
                        <div className="text-lg text-gray-900 py-2">
                          {competition.year || '미설정'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        대회 설명
                      </label>
                      {editMode ? (
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                          placeholder="대회에 대한 설명을 입력하세요"
                        />
                      ) : (
                        <div className="text-gray-900 py-2 min-h-[100px]">
                          {competition.description || '설명이 없습니다'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 일정 정보 */}
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="w-6 h-6 text-kopri-blue mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">대회 일정</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        시작일
                      </label>
                      {editMode ? (
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                        />
                      ) : (
                        <div className="text-lg text-gray-900 py-2">
                          {competition.start_date 
                            ? format(parseISO(competition.start_date), 'yyyy년 M월 d일 (EEE)', { locale: ko })
                            : '미설정'
                          }
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        종료일
                      </label>
                      {editMode ? (
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                        />
                      ) : (
                        <div className="text-lg text-gray-900 py-2">
                          {competition.end_date 
                            ? format(parseISO(competition.end_date), 'yyyy년 M월 d일 (EEE)', { locale: ko })
                            : '미설정'
                          }
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        전반 시간 (분)
                      </label>
                      {editMode ? (
                        <input
                          type="number"
                          value={formData.half_duration_minutes}
                          onChange={(e) => setFormData({ ...formData, half_duration_minutes: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                          placeholder="45"
                          min="1"
                          max="45"
                        />
                      ) : (
                        <div className="text-lg text-gray-900 py-2">
                          {competition.half_duration_minutes || 45}분 (전반/후반 각각)
                        </div>
                      )}
                    </div>

                    {/* 대회 기간 표시 */}
                    {competition.start_date && competition.end_date && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-900">대회 기간</span>
                        </div>
                        <div className="text-blue-800">
                          {Math.ceil((new Date(competition.end_date).getTime() - new Date(competition.start_date).getTime()) / (1000 * 60 * 60 * 24) + 1)}일간
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 생성/수정 정보 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>
                      생성일: {format(new Date(competition.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                    </div>
                    <div>
                      수정일: {format(new Date(competition.updated_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminOnly>
  )
}