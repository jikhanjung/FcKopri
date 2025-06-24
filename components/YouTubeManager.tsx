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
  EyeIcon
} from '@heroicons/react/24/outline'
import { PlayIcon as PlaySolidIcon } from '@heroicons/react/24/solid'

interface YouTubeManagerProps {
  matchId: string
  currentYouTubeUrl?: string
  currentYouTubeTitle?: string
  currentYouTubeThumbnail?: string
  currentYouTubeDuration?: string
  onYouTubeUpdate?: (data: {
    youtube_url?: string
    youtube_title?: string
    youtube_thumbnail_url?: string
    youtube_duration?: string
  }) => void
}

interface YouTubeVideoInfo {
  title: string
  thumbnail: string
  duration: string
  channelTitle: string
  viewCount: string
}

export default function YouTubeManager({ 
  matchId, 
  currentYouTubeUrl, 
  currentYouTubeTitle,
  currentYouTubeThumbnail,
  currentYouTubeDuration,
  onYouTubeUpdate 
}: YouTubeManagerProps) {
  const { isAdmin } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState(currentYouTubeUrl || '')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null)

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

  // 유튜브 썸네일 URL 생성
  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  // 유튜브 임베드 URL 생성
  const getEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`
  }

  // 유튜브 API로 비디오 정보 가져오기 (실제로는 서버 사이드에서 해야 함)
  const fetchVideoInfo = async (videoId: string): Promise<YouTubeVideoInfo | null> => {
    try {
      // 클라이언트에서는 기본 정보만 제공
      const thumbnail = getThumbnailUrl(videoId)
      
      return {
        title: '하이라이트 영상',
        thumbnail,
        duration: '00:00',
        channelTitle: 'KOPRI CUP',
        viewCount: '0'
      }
    } catch (error) {
      console.error('Error fetching video info:', error)
      return null
    }
  }

  // URL 유효성 검사 및 비디오 정보 가져오기
  const validateAndFetchVideoInfo = async (url: string) => {
    if (!url.trim()) {
      setVideoInfo(null)
      return
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      alert('올바른 유튜브 URL을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const info = await fetchVideoInfo(videoId)
      if (info) {
        setVideoInfo(info)
      }
    } catch (error) {
      console.error('Error validating URL:', error)
      alert('비디오 정보를 가져올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 유튜브 링크 저장
  const saveYouTubeLink = async () => {
    if (!youtubeUrl.trim()) {
      // URL이 비어있으면 삭제
      await removeYouTubeLink()
      return
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      alert('올바른 유튜브 URL을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const thumbnail = getThumbnailUrl(videoId)
      const info = await fetchVideoInfo(videoId)
      
      const updateData = {
        youtube_url: youtubeUrl.trim(),
        youtube_title: info?.title || '하이라이트 영상',
        youtube_thumbnail_url: thumbnail,
        youtube_duration: info?.duration || null
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

      if (error) throw error

      setIsEditing(false)
      onYouTubeUpdate?.({
        youtube_url: updateData.youtube_url,
        youtube_title: updateData.youtube_title,
        youtube_thumbnail_url: updateData.youtube_thumbnail_url,
        youtube_duration: updateData.youtube_duration || undefined
      })
      alert('유튜브 링크가 저장되었습니다!')

    } catch (error) {
      console.error('Error saving YouTube link:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 유튜브 링크 삭제
  const removeYouTubeLink = async () => {
    if (!confirm('유튜브 링크를 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const updateData = {
        youtube_url: null,
        youtube_title: null,
        youtube_thumbnail_url: null,
        youtube_duration: null
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

      if (error) throw error

      setYoutubeUrl('')
      setVideoInfo(null)
      setIsEditing(false)
      onYouTubeUpdate?.({
        youtube_url: undefined,
        youtube_title: undefined,
        youtube_thumbnail_url: undefined,
        youtube_duration: undefined
      })
      alert('유튜브 링크가 삭제되었습니다!')

    } catch (error) {
      console.error('Error removing YouTube link:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // URL 변경 시 자동 검증
  useEffect(() => {
    if (youtubeUrl && isEditing) {
      const timeoutId = setTimeout(() => {
        validateAndFetchVideoInfo(youtubeUrl)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [youtubeUrl, isEditing])

  // 현재 유튜브 링크가 있는 경우
  if (currentYouTubeUrl && !isEditing) {
    const videoId = extractVideoId(currentYouTubeUrl)
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <PlaySolidIcon className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              하이라이트 영상
            </h3>
          </div>
          
          {isAdmin && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-kopri-blue"
                title="수정"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={removeYouTubeLink}
                className="p-2 text-gray-500 hover:text-red-500"
                title="삭제"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* 유튜브 임베드 */}
        {videoId && (
          <div className="relative w-full h-0 pb-[56.25%] mb-4">
            <iframe
              src={getEmbedUrl(videoId)}
              title={currentYouTubeTitle || '하이라이트 영상'}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* 비디오 정보 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {currentYouTubeTitle || '하이라이트 영상'}
          </h4>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-4">
            {currentYouTubeDuration && (
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {currentYouTubeDuration}
              </div>
            )}
            <a
              href={currentYouTubeUrl}
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
  }

  // 편집 모드 또는 링크가 없는 경우
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <PlayIcon className="w-6 h-6 text-gray-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            하이라이트 영상
          </h3>
        </div>
        
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-1 text-sm text-kopri-blue hover:text-kopri-blue/80"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            영상 추가
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* URL 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              유튜브 URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* 미리보기 */}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">비디오 정보를 가져오는 중...</p>
            </div>
          )}

          {videoInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex space-x-4">
                <img
                  src={videoInfo.thumbnail}
                  alt="썸네일"
                  className="w-32 h-18 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-video.png'
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {videoInfo.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {videoInfo.channelTitle}
                  </p>
                  {videoInfo.duration && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      길이: {videoInfo.duration}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex space-x-3">
            <button
              onClick={saveYouTubeLink}
              disabled={loading}
              className="px-4 py-2 bg-kopri-blue text-white rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setYoutubeUrl(currentYouTubeUrl || '')
                setVideoInfo(null)
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <PlayIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isAdmin ? '하이라이트 영상을 추가해보세요' : '아직 하이라이트 영상이 없습니다'}
          </p>
        </div>
      )}
    </div>
  )
}