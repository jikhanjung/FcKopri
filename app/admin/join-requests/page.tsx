'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LeagueJoinRequestDetails } from '@/types'
import { 
  UserPlusIcon, 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import AdminRoute from '@/components/AdminRoute'

function AdminJoinRequestsPageContent() {
  const { user, isSuperAdmin, isRoleAdmin, loading: authLoading } = useAuth()
  const [requests, setRequests] = useState<LeagueJoinRequestDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<LeagueJoinRequestDetails | null>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    if (!authLoading && !isSuperAdmin && !isRoleAdmin) {
      setError('권한이 없습니다.')
      setLoading(false)
      return
    }

    if (!authLoading) {
      fetchRequests()
    }
  }, [authLoading, isSuperAdmin, isRoleAdmin])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('league_join_request_details')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error: any) {
      console.error('참여 신청 목록 조회 오류:', error)
      setError(error.message || '참여 신청 목록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (request: LeagueJoinRequestDetails, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(action)
    setResponseMessage('')
    setShowResponseModal(true)
  }

  const processRequest = async () => {
    if (!selectedRequest || !user) return

    try {
      setProcessing(true)

      if (actionType === 'approve') {
        const { error } = await supabase.rpc('approve_league_join_request', {
          request_id: selectedRequest.id,
          admin_user_id: user.id,
          response_message: responseMessage.trim() || null
        })
        if (error) throw error
      } else {
        const { error } = await supabase.rpc('reject_league_join_request', {
          request_id: selectedRequest.id,
          admin_user_id: user.id,
          response_message: responseMessage.trim() || null
        })
        if (error) throw error
      }

      await fetchRequests()
      setShowResponseModal(false)
      setSelectedRequest(null)
      alert(`신청이 ${actionType === 'approve' ? '승인' : '거부'}되었습니다.`)
    } catch (error: any) {
      console.error('신청 처리 오류:', error)
      alert(error.message || '신청 처리에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />
      case 'approved': return <CheckIcon className="w-4 h-4" />
      case 'rejected': return <XMarkIcon className="w-4 h-4" />
      default: return null
    }
  }

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.status === filter
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <UserPlusIcon className="w-8 h-8 text-kopri-blue" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            리그 참여 신청 관리
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          사용자들의 리그 참여 신청을 검토하고 승인/거부할 수 있습니다.
        </p>
      </div>

      {/* 필터 탭 */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: '대기중', count: requests.filter(r => r.status === 'pending').length },
              { key: 'approved', label: '승인됨', count: requests.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: '거부됨', count: requests.filter(r => r.status === 'rejected').length },
              { key: 'all', label: '전체', count: requests.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  filter === tab.key
                    ? 'border-kopri-blue text-kopri-blue dark:text-kopri-lightblue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 신청 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {filter === 'pending' ? '대기 중인 신청이 없습니다' : '해당하는 신청이 없습니다'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              사용자들이 신청하면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* 사용자 정보 */}
                    <div className="flex-shrink-0">
                      {request.user_avatar_url ? (
                        <img
                          src={request.user_avatar_url}
                          alt="프로필"
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <UserPlusIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {request.user_display_name || '이름 없음'}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">
                            {request.status === 'pending' ? '심사중' :
                             request.status === 'approved' ? '승인됨' : '거부됨'}
                          </span>
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <p>이메일: {request.user_email}</p>
                        {request.user_department && (
                          <p>부서: {request.user_department}</p>
                        )}
                        <p>신청 리그: <span className="font-medium text-kopri-blue dark:text-kopri-lightblue">{request.competition_name}</span></p>
                        <p>신청 날짜: {new Date(request.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>

                      {/* 신청 메시지 */}
                      {request.message && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {request.message}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 관리자 응답 */}
                      {request.admin_response && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <EyeIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-blue-800 dark:text-blue-300 font-medium">
                                관리자 응답:
                              </p>
                              <p className="text-blue-700 dark:text-blue-400 mt-1">
                                {request.admin_response}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 처리 정보 */}
                      {request.processed_at && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          처리 일시: {new Date(request.processed_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {request.admin_display_name && (
                            <span> (처리자: {request.admin_display_name})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(request, 'approve')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        승인
                      </button>
                      <button
                        onClick={() => handleAction(request, 'reject')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        거부
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 응답 모달 */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  신청 {actionType === 'approve' ? '승인' : '거부'}
                </h3>
                <button
                  onClick={() => {
                    setShowResponseModal(false)
                    setSelectedRequest(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRequest.user_display_name || selectedRequest.user_email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRequest.competition_name} 참여 신청
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  응답 메시지 (선택사항)
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-kopri-blue focus:border-kopri-blue dark:bg-gray-700 dark:text-white"
                  placeholder={`${actionType === 'approve' ? '승인' : '거부'} 사유나 안내사항을 입력해주세요...`}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false)
                    setSelectedRequest(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  disabled={processing}
                >
                  취소
                </button>
                <button
                  onClick={processRequest}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? '처리 중...' : (actionType === 'approve' ? '승인' : '거부')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminJoinRequestsPage() {
  return (
    <AdminRoute requiredRole="admin">
      <AdminJoinRequestsPageContent />
    </AdminRoute>
  )
}