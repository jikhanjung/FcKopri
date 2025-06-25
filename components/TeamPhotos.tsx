'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import CommentSection from './CommentSection'
import { 
  PhotoIcon, 
  PlusIcon, 
  XMarkIcon, 
  EyeIcon,
  TrashIcon,
  CloudArrowUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'

interface TeamPhoto {
  id: string
  team_id: string
  filename: string
  caption: string | null
  file_path: string
  file_size: number | null
  mime_type: string | null
  photo_type: 'logo' | 'team' | 'training' | 'general'
  uploaded_by: string
  created_at: string
}

interface TeamPhotosProps {
  teamId: string
  teamName: string
}

const photoTypes = [
  { value: 'logo', label: '팀 로고', icon: '🏆' },
  { value: 'team', label: '팀 단체사진', icon: '👥' },
  { value: 'training', label: '훈련사진', icon: '⚽' },
  { value: 'general', label: '일반사진', icon: '📷' }
] as const

export default function TeamPhotos({ teamId, teamName }: TeamPhotosProps) {
  const { isAdmin } = useAuth()
  const [photos, setPhotos] = useState<TeamPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<TeamPhoto | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [caption, setCaption] = useState('')
  const [photoType, setPhotoType] = useState<TeamPhoto['photo_type']>('general')
  const [activeFilter, setActiveFilter] = useState<TeamPhoto['photo_type'] | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPhotos()
    
    // 실시간 업데이트 구독
    const channel = supabase
      .channel(`team_photos_${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_photos',
        filter: `team_id=eq.${teamId}`
      }, () => {
        loadPhotos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId])

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('team_photos')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Team photos not available:', error)
        setPhotos([])
      } else {
        setPhotos(data || [])
      }
    } catch (error) {
      console.error('Error loading team photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        // 파일 크기 체크 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}은(는) 10MB를 초과합니다.`)
          continue
        }

        // 이미지 파일 체크
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}은(는) 이미지 파일이 아닙니다.`)
          continue
        }

        // 파일명 생성 (timestamp 포함)
        const timestamp = Date.now()
        const fileExt = file.name.split('.').pop()
        const fileName = `${photoType}_${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `team_${teamId}/${fileName}`

        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('team-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          alert(`${file.name} 업로드 실패: ${uploadError.message}`)
          continue
        }

        // 데이터베이스에 메타데이터 저장
        const { error: dbError } = await supabase
          .from('team_photos')
          .insert([{
            team_id: teamId,
            filename: file.name,
            caption: caption || null,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            photo_type: photoType,
            uploaded_by: 'admin'
          }])

        if (dbError) {
          console.error('Database error:', dbError)
          // Storage에서 파일 삭제 (롤백)
          await supabase.storage
            .from('team-photos')
            .remove([uploadData.path])
          alert(`${file.name} 메타데이터 저장 실패`)
          continue
        }
      }

      // 폼 리셋
      setCaption('')
      setPhotoType('general')
      setShowUploadForm(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 사진 목록 새로고침
      loadPhotos()

    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('사진 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const deletePhoto = async (photo: TeamPhoto) => {
    if (!confirm(`"${photo.filename}"을(를) 삭제하시겠습니까?`)) return

    try {
      // Storage에서 파일 삭제
      const { error: storageError } = await supabase.storage
        .from('team-photos')
        .remove([photo.file_path])

      if (storageError) {
        console.error('Storage delete error:', storageError)
      }

      // 데이터베이스에서 메타데이터 삭제
      const { error: dbError } = await supabase
        .from('team_photos')
        .delete()
        .eq('id', photo.id)

      if (dbError) {
        console.error('Database delete error:', dbError)
        alert('사진 삭제 중 오류가 발생했습니다.')
        return
      }

      // 목록 새로고침
      loadPhotos()
      setSelectedPhoto(null)

    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('사진 삭제 중 오류가 발생했습니다.')
    }
  }

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('team-photos')
      .getPublicUrl(filePath)
    return data.publicUrl
  }

  const filteredPhotos = activeFilter === 'all' 
    ? photos 
    : photos.filter(photo => photo.photo_type === activeFilter)

  const getPhotoTypeInfo = (type: TeamPhoto['photo_type']) => {
    return photoTypes.find(pt => pt.value === type) || photoTypes[3]
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <UserGroupIcon className="w-6 h-6 text-kopri-blue dark:text-kopri-lightblue mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {teamName} 팀 사진 ({photos.length})
            </h3>
          </div>

          {/* 업로드 버튼 (모든 사용자) */}
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center px-3 py-2 bg-kopri-blue text-white rounded-lg hover:bg-kopri-blue/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            사진 추가
          </button>
        </div>

        {/* 필터 버튼 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-kopri-blue text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            전체 ({photos.length})
          </button>
          {photoTypes.map((type) => {
            const count = photos.filter(p => p.photo_type === type.value).length
            return (
              <button
                key={type.value}
                onClick={() => setActiveFilter(type.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === type.value
                    ? 'bg-kopri-blue text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {type.icon} {type.label} ({count})
              </button>
            )
          })}
        </div>

        {/* 사진이 없는 경우 */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-8">
            <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {activeFilter === 'all' 
                ? '아직 업로드된 사진이 없습니다' 
                : `${getPhotoTypeInfo(activeFilter as TeamPhoto['photo_type']).label} 사진이 없습니다`
              }
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-4 text-kopri-blue hover:text-kopri-blue/80 font-medium"
            >
              첫 번째 사진을 업로드해보세요
            </button>
          </div>
        ) : (
          /* 사진 그리드 */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => {
              const typeInfo = getPhotoTypeInfo(photo.photo_type)
              return (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                    <Image
                      src={getPhotoUrl(photo.file_path)}
                      alt={photo.caption || photo.filename}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={false}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      onError={(e) => {
                        console.error('Image loading error:', e)
                        // 에러 시 기본 이미지로 대체하거나 숨김 처리
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <EyeIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* 사진 타입 배지 */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {typeInfo.icon} {typeInfo.label}
                    </div>
                  </div>

                  {/* 캡션 */}
                  {photo.caption && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                      {photo.caption}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 업로드 모달 */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                팀 사진 업로드
              </h3>
              <button
                onClick={() => {
                  setShowUploadForm(false)
                  setCaption('')
                  setPhotoType('general')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 사진 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  사진 유형
                </label>
                <select
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value as TeamPhoto['photo_type'])}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-kopri-blue focus:border-transparent
                           disabled:opacity-50"
                >
                  {photoTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 파일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  사진 선택 (최대 10MB, 여러 파일 선택 가능)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-kopri-blue file:text-white
                           hover:file:bg-kopri-blue/90
                           file:disabled:opacity-50"
                />
              </div>

              {/* 캡션 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  사진 설명 (선택사항)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="사진에 대한 설명을 입력하세요"
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-kopri-blue focus:border-transparent
                           disabled:opacity-50"
                />
              </div>

              {/* 업로드 상태 */}
              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <CloudArrowUpIcon className="w-6 h-6 text-kopri-blue animate-bounce mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">업로드 중...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 사진 상세 모달 */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            {/* 삭제 버튼 (관리자만) */}
            {isAdmin && (
              <button
                onClick={() => deletePhoto(selectedPhoto)}
                className="absolute top-4 left-4 text-white hover:text-red-300 z-10"
              >
                <TrashIcon className="w-8 h-8" />
              </button>
            )}

            {/* 이미지 */}
            <div className="relative mb-6">
              <Image
                src={getPhotoUrl(selectedPhoto.file_path)}
                alt={selectedPhoto.caption || selectedPhoto.filename}
                width={1200}
                height={800}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>

            {/* 댓글 섹션 */}
            <div className="mb-6 max-h-[40vh] overflow-y-auto">
              <CommentSection 
                targetType="team_photo" 
                targetId={selectedPhoto.id} 
                title="사진 댓글"
              />
            </div>

            {/* 정보 */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">
                  {getPhotoTypeInfo(selectedPhoto.photo_type).icon}
                </span>
                <span className="text-sm bg-kopri-blue text-white px-2 py-1 rounded">
                  {getPhotoTypeInfo(selectedPhoto.photo_type).label}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{selectedPhoto.filename}</h4>
              {selectedPhoto.caption && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedPhoto.caption}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(selectedPhoto.created_at).toLocaleString('ko-KR')}
                {selectedPhoto.file_size && (
                  <span className="ml-2">
                    ({(selectedPhoto.file_size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}