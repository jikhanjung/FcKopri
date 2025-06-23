'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon
} from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  author_name: string
  author_ip: string
  is_admin: boolean
  parent_comment_id?: string
  created_at: string
  updated_at: string
  replies?: Comment[]
  like_count: number
  dislike_count: number
  user_reaction?: 'like' | 'dislike' | null
}

interface CommentSectionProps {
  targetType: 'match' | 'match_photo' | 'team_photo' | 'team'
  targetId: string
  title?: string
}

export default function CommentSection({ targetType, targetId, title }: CommentSectionProps) {
  const { isAdmin } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // 댓글 작성 상태
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  
  useEffect(() => {
    loadComments()
    
    // 실시간 댓글 업데이트 구독
    const channel = supabase
      .channel(`comments_${targetType}_${targetId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `${targetType}_id=eq.${targetId}`
      }, () => {
        loadComments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [targetType, targetId])

  const loadComments = async () => {
    try {
      // 사용자 IP 가져오기
      const ipResponse = await fetch('/api/get-client-ip')
      const { ip } = await ipResponse.json()

      // 댓글과 반응 데이터 가져오기
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          comment_reactions(reaction_type)
        `)
        .eq(`${targetType}_id`, targetId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // 댓글별 반응 집계 및 사용자 반응 확인
      const commentsWithReactions = await Promise.all(
        commentsData?.map(async (comment) => {
          // 반응 집계
          const likes = comment.comment_reactions?.filter((r: any) => r.reaction_type === 'like').length || 0
          const dislikes = comment.comment_reactions?.filter((r: any) => r.reaction_type === 'dislike').length || 0
          
          // 사용자 반응 확인
          const { data: userReaction } = await supabase
            .from('comment_reactions')
            .select('reaction_type')
            .eq('comment_id', comment.id)
            .eq('user_ip', ip)
            .single()

          return {
            ...comment,
            like_count: likes,
            dislike_count: dislikes,
            user_reaction: userReaction?.reaction_type || null
          }
        }) || []
      )

      // 댓글을 계층 구조로 변환
      const topLevelComments = commentsWithReactions.filter(comment => !comment.parent_comment_id)
      const commentTree = topLevelComments.map(comment => ({
        ...comment,
        replies: commentsWithReactions.filter(reply => reply.parent_comment_id === comment.id)
      }))

      setComments(commentTree)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async (content: string, parentId?: string) => {
    if (!content.trim() || !authorName.trim()) return

    setSubmitting(true)
    try {
      const ipResponse = await fetch('/api/get-client-ip')
      const { ip } = await ipResponse.json()

      const commentData = {
        [`${targetType}_id`]: targetId,
        content: content.trim(),
        author_name: authorName.trim(),
        author_ip: ip,
        is_admin: isAdmin,
        parent_comment_id: parentId || null
      }

      const { error } = await supabase
        .from('comments')
        .insert(commentData)

      if (error) throw error

      // 폼 리셋
      if (parentId) {
        setReplyContent('')
        setReplyingTo(null)
      } else {
        setNewComment('')
      }

      await loadComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!isAdmin) return
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      await loadComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  const toggleReaction = async (commentId: string, reactionType: 'like' | 'dislike') => {
    try {
      const ipResponse = await fetch('/api/get-client-ip')
      const { ip } = await ipResponse.json()

      const comment = comments.flatMap(c => [c, ...(c.replies || [])]).find(c => c.id === commentId)
      if (!comment) return

      if (comment.user_reaction === reactionType) {
        // 같은 반응이면 제거
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_ip', ip)

        if (error) throw error
      } else {
        // 다른 반응이면 upsert
        const { error } = await supabase
          .from('comment_reactions')
          .upsert({
            comment_id: commentId,
            user_ip: ip,
            reaction_type: reactionType
          })

        if (error) throw error
      }

      await loadComments()
    } catch (error) {
      console.error('Error toggling reaction:', error)
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 댓글 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              {comment.is_admin ? (
                <ShieldCheckIcon className="w-5 h-5 text-kopri-blue mr-1" />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-400 mr-1" />
              )}
              <span className={`font-semibold ${comment.is_admin ? 'text-kopri-blue' : 'text-gray-900 dark:text-gray-100'}`}>
                {comment.author_name}
                {comment.is_admin && (
                  <span className="ml-1 text-xs bg-kopri-blue text-white px-1 rounded">관리자</span>
                )}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => deleteComment(comment.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="댓글 삭제"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 댓글 내용 */}
        <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{comment.content}</p>

        {/* 댓글 액션 */}
        <div className="flex items-center space-x-4">
          {/* 좋아요 */}
          <button
            onClick={() => toggleReaction(comment.id, 'like')}
            className={`flex items-center space-x-1 text-sm ${
              comment.user_reaction === 'like' 
                ? 'text-kopri-blue' 
                : 'text-gray-500 hover:text-kopri-blue'
            }`}
          >
            {comment.user_reaction === 'like' ? (
              <HandThumbUpSolidIcon className="w-4 h-4" />
            ) : (
              <HandThumbUpIcon className="w-4 h-4" />
            )}
            <span>{comment.like_count || 0}</span>
          </button>

          {/* 싫어요 */}
          <button
            onClick={() => toggleReaction(comment.id, 'dislike')}
            className={`flex items-center space-x-1 text-sm ${
              comment.user_reaction === 'dislike' 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            {comment.user_reaction === 'dislike' ? (
              <HandThumbDownSolidIcon className="w-4 h-4" />
            ) : (
              <HandThumbDownIcon className="w-4 h-4" />
            )}
            <span>{comment.dislike_count || 0}</span>
          </button>

          {/* 답글 */}
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-sm text-gray-500 hover:text-kopri-blue flex items-center space-x-1"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>답글</span>
            </button>
          )}
        </div>

        {/* 답글 작성 폼 */}
        {replyingTo === comment.id && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="mb-3">
              <input
                type="text"
                placeholder="이름"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue mb-2"
              />
              <textarea
                placeholder="답글을 입력하세요..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                rows={2}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => submitComment(replyContent, comment.id)}
                disabled={!replyContent.trim() || !authorName.trim() || submitting}
                className="bg-kopri-blue text-white px-4 py-2 rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '작성 중...' : '답글 작성'}
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent('')
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 답글들 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      {/* 댓글 섹션 헤더 */}
      <div className="flex items-center mb-6">
        <ChatBubbleLeftIcon className="w-6 h-6 text-kopri-blue mr-2" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title || '댓글'} ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* 새 댓글 작성 */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="mb-3">
          <input
            type="text"
            placeholder="이름"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue mb-2 dark:bg-gray-700 dark:text-gray-100"
          />
          <textarea
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue dark:bg-gray-700 dark:text-gray-100"
            rows={3}
          />
        </div>
        <button
          onClick={() => submitComment(newComment)}
          disabled={!newComment.trim() || !authorName.trim() || submitting}
          className="bg-kopri-blue text-white px-6 py-2 rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '작성 중...' : '댓글 작성'}
        </button>
      </div>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">첫 번째 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}