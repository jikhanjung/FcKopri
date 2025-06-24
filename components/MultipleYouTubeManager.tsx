'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  PlayIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { PlayIcon as PlaySolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface MatchVideo {
  id: string
  match_id: string
  video_type: 'highlight' | 'goals' | 'full_match' | 'interview' | 'analysis' | 'other'
  title: string
  youtube_url: string
  youtube_video_id?: string
  thumbnail_url?: string
  duration?: string
  description?: string
  display_order: number
  is_featured: boolean
  uploaded_by: string
  created_at: string
  updated_at: string
}

interface MultipleYouTubeManagerProps {
  matchId: string
}

const VIDEO_TYPES = {
  highlight: { label: '하이라이트', icon: '🎬', color: 'text-red-500' },
  goals: { label: '골 장면', icon: '⚽', color: 'text-yellow-500' },
  full_match: { label: '전체 경기', icon: '📹', color: 'text-blue-500' },
  interview: { label: '인터뷰', icon: '🎤', color: 'text-green-500' },
  analysis: { label: '경기 분석', icon: '📊', color: 'text-purple-500' },
  other: { label: '기타', icon: '📽️', color: 'text-gray-500' }
} as const

export default function MultipleYouTubeManager({ matchId }: MultipleYouTubeManagerProps) {
  const { isAdmin } = useAuth()
  const [videos, setVideos] = useState<MatchVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingVideo, setEditingVideo] = useState<MatchVideo | null>(null)
  const [formData, setFormData] = useState({
    video_type: 'highlight' as keyof typeof VIDEO_TYPES,
    title: '',
    youtube_url: '',
    description: '',
    is_featured: false
  })

  // 비디오 목록 로드
  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('match_videos')
        .select('*')
        .eq('match_id', matchId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  // 유튜브 비디오 ID 추출
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // 썸네일 URL 생성
  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  // 임베드 URL 생성
  const getEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`
  }

  // 비디오 저장
  const saveVideo = async () => {
    if (!formData.youtube_url.trim() || !formData.title.trim()) {
      alert('제목과 유튜브 URL을 입력해주세요.')
      return
    }

    const videoId = extractVideoId(formData.youtube_url)
    if (!videoId) {
      alert('올바른 유튜브 URL을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const videoData = {
        match_id: matchId,
        video_type: formData.video_type,
        title: formData.title.trim(),
        youtube_url: formData.youtube_url.trim(),
        youtube_video_id: videoId,
        thumbnail_url: getThumbnailUrl(videoId),
        description: formData.description.trim() || null,
        display_order: videos.length,
        is_featured: formData.is_featured,
        uploaded_by: 'admin'
      }

      let result
      if (editingVideo) {
        result = await supabase
          .from('match_videos')
          .update(videoData)
          .eq('id', editingVideo.id)
      } else {
        result = await supabase
          .from('match_videos')
          .insert([videoData])
      }

      if (result.error) throw result.error

      // 대표 영상으로 설정한 경우 다른 영상들의 is_featured를 false로 변경
      if (formData.is_featured) {
        await supabase
          .from('match_videos')
          .update({ is_featured: false })
          .eq('match_id', matchId)
          .neq('id', editingVideo?.id || '')
      }

      await loadVideos()
      resetForm()
      alert(editingVideo ? '영상이 수정되었습니다!' : '영상이 추가되었습니다!')

    } catch (error) {
      console.error('Error saving video:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 비디오 삭제
  const deleteVideo = async (video: MatchVideo) => {
    if (!confirm(`"${video.title}" 영상을 삭제하시겠습니까?`)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('match_videos')
        .delete()
        .eq('id', video.id)

      if (error) throw error

      await loadVideos()
      alert('영상이 삭제되었습니다!')

    } catch (error) {
      console.error('Error deleting video:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 대표 영상 설정
  const setFeaturedVideo = async (video: MatchVideo) => {
    setLoading(true)
    try {
      // 모든 영상의 is_featured를 false로 변경
      await supabase
        .from('match_videos')
        .update({ is_featured: false })
        .eq('match_id', matchId)

      // 선택된 영상을 대표 영상으로 설정
      const { error } = await supabase
        .from('match_videos')
        .update({ is_featured: true })
        .eq('id', video.id)

      if (error) throw error

      await loadVideos()
    } catch (error) {
      console.error('Error setting featured video:', error)
      alert('대표 영상 설정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 순서 변경
  const moveVideo = async (video: MatchVideo, direction: 'up' | 'down') => {
    const currentIndex = videos.findIndex(v => v.id === video.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (targetIndex < 0 || targetIndex >= videos.length) return

    const updatedVideos = [...videos]
    const [movedVideo] = updatedVideos.splice(currentIndex, 1)
    updatedVideos.splice(targetIndex, 0, movedVideo)

    // display_order 업데이트
    const updates = updatedVideos.map((v, index) => ({
      id: v.id,
      display_order: index
    }))

    setLoading(true)
    try {
      for (const update of updates) {
        await supabase
          .from('match_videos')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }

      await loadVideos()
    } catch (error) {
      console.error('Error moving video:', error)
      alert('순서 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      video_type: 'highlight',
      title: '',
      youtube_url: '',
      description: '',
      is_featured: false
    })
    setIsAdding(false)
    setEditingVideo(null)
  }

  // 편집 모드 시작
  const startEdit = (video: MatchVideo) => {
    setFormData({
      video_type: video.video_type as keyof typeof VIDEO_TYPES,
      title: video.title,
      youtube_url: video.youtube_url,
      description: video.description || '',
      is_featured: video.is_featured
    })
    setEditingVideo(video)
    setIsAdding(true)
  }

  useEffect(() => {
    loadVideos()
  }, [matchId])

  if (loading && videos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <PlaySolidIcon className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            경기 영상 ({videos.length})
          </h3>
        </div>
        
        {isAdmin && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center px-3 py-1 text-sm text-kopri-blue hover:text-kopri-blue/80"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            영상 추가
          </button>
        )}
      </div>

      {/* 영상 추가/편집 폼 */}
      {isAdding && isAdmin && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            {editingVideo ? '영상 수정' : '새 영상 추가'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                영상 유형
              </label>
              <select
                value={formData.video_type}
                onChange={(e) => setFormData({ ...formData, video_type: e.target.value as keyof typeof VIDEO_TYPES })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue dark:bg-gray-700 dark:text-gray-100"
              >
                {Object.entries(VIDEO_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="영상 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              유튜브 URL
            </label>
            <input
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="영상에 대한 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-gray-300 text-kopri-blue focus:ring-kopri-blue"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                대표 영상으로 설정 (경기 카드에 표시됨)
              </span>
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={saveVideo}
              disabled={loading}
              className="px-4 py-2 bg-kopri-blue text-white rounded-md hover:bg-kopri-blue/90 disabled:opacity-50"
            >
              {loading ? '저장 중...' : editingVideo ? '수정' : '추가'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 영상 목록 */}
      {videos.length === 0 ? (
        <div className="text-center py-8">
          <PlayIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isAdmin ? '첫 번째 영상을 추가해보세요' : '아직 등록된 영상이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {videos.map((video, index) => {
            const videoType = VIDEO_TYPES[video.video_type]
            const videoId = video.youtube_video_id || extractVideoId(video.youtube_url)
            
            return (
              <div
                key={video.id}
                className={`border rounded-lg p-4 ${video.is_featured ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg ${videoType.color}`}>
                      {videoType.icon}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {video.title}
                        </h4>
                        {video.is_featured && (
                          <StarSolidIcon className="w-5 h-5 text-yellow-500" title="대표 영상" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {videoType.label}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveVideo(video, 'up')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="위로 이동"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                      )}
                      {index < videos.length - 1 && (
                        <button
                          onClick={() => moveVideo(video, 'down')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="아래로 이동"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                      )}
                      {!video.is_featured && (
                        <button
                          onClick={() => setFeaturedVideo(video)}
                          className="p-1 text-gray-400 hover:text-yellow-500"
                          title="대표 영상으로 설정"
                        >
                          <StarIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(video)}
                        className="p-1 text-gray-400 hover:text-kopri-blue"
                        title="수정"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVideo(video)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="삭제"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 유튜브 임베드 */}
                {videoId && (
                  <div className="relative w-full h-0 pb-[56.25%] mb-4">
                    <iframe
                      src={getEmbedUrl(videoId)}
                      title={video.title}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* 영상 정보 */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  {video.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      {video.duration && (
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {video.duration}
                        </div>
                      )}
                      <span>
                        {new Date(video.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <a
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-kopri-blue hover:text-kopri-blue/80"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      유튜브에서 보기
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}