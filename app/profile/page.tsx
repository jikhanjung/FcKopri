'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    display_name: '',
    department: '',
    bio: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        department: profile.department || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: editForm.display_name.trim() || null,
          department: editForm.department.trim() || null,
          bio: editForm.bio.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      setIsEditing(false)
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      alert('프로필 업데이트에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        department: profile.department || '',
        bio: profile.bio || ''
      })
    }
    setIsEditing(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 리다이렉트 중
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <UserIcon className="w-8 h-8 text-kopri-blue" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            내 프로필
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          프로필 정보를 확인하고 수정할 수 있습니다.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-kopri-blue to-kopri-lightblue px-6 py-8">
          <div className="flex items-center space-x-6">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="프로필 사진"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {profile?.display_name || user.user_metadata?.name || '이름 없음'}
              </h2>
              <p className="text-white/80 text-lg">
                {user.email}
              </p>
              {profile?.provider && (
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {profile.provider === 'google' ? '구글 로그인' : 
                   profile.provider === 'kakao' ? '카카오 로그인' : 
                   profile.provider === 'naver' ? '네이버 로그인' : 
                   '이메일 로그인'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 프로필 정보 */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              프로필 정보
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-kopri-blue hover:text-kopri-blue/80 font-medium"
              >
                <PencilIcon className="w-4 h-4" />
                <span>편집</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-1 bg-kopri-blue text-white px-3 py-1 rounded-lg hover:bg-kopri-blue/80 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{saving ? '저장 중...' : '저장'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>취소</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 표시 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                표시 이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                  placeholder="표시될 이름을 입력하세요"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {profile?.display_name || '설정되지 않음'}
                  </span>
                </div>
              )}
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {user.email}
                </span>
              </div>
            </div>

            {/* 부서/소속 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                부서/소속
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-kopri-blue focus:border-transparent"
                  placeholder="부서나 소속을 입력하세요"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {profile?.department || '설정되지 않음'}
                  </span>
                </div>
              )}
            </div>

            {/* 가입일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                가입일
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '알 수 없음'}
                </span>
              </div>
            </div>
          </div>

          {/* 자기소개 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              자기소개
            </label>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-kopri-blue focus:border-transparent resize-none"
                placeholder="자기소개를 입력하세요..."
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[100px]">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {profile?.bio || '자기소개가 없습니다.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}