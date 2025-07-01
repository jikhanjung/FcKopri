'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Competition, LeagueJoinRequest } from '@/types'
import { TrophyIcon, PlusIcon, ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function SelectLeaguePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [myRequests, setMyRequests] = useState<LeagueJoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!authLoading && user) {
      checkUserLeagues()
    }
  }, [authLoading, user, router])

  // 실시간 신청 상태 업데이트 구독
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('league_join_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'league_join_requests',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('신청 상태 변경:', payload)
        
        if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
          // 승인되면 홈으로 리다이렉트
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          // 기타 변경사항은 데이터 새로고침
          checkUserLeagues()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, router])

  const checkUserLeagues = async () => {
    try {
      setLoading(true)

      // 사용자가 이미 참여한 리그가 있는지 확인
      const { data: userCompetitions, error: userError } = await supabase
        .from('user_competition_relations')
        .select('*')
        .eq('user_id', user?.id)

      if (userError) throw userError

      // 이미 참여한 리그가 있으면 홈으로 리다이렉트
      if (userCompetitions && userCompetitions.length > 0) {
        router.push('/')
        return
      }

      // 사용자 신청 내역 조회
      const { data: requests, error: requestError } = await supabase
        .from('league_join_requests')
        .select('*')
        .eq('user_id', user?.id)

      if (requestError) throw requestError
      setMyRequests(requests || [])

      // 모든 리그 목록 조회
      await fetchCompetitions()
    } catch (error: any) {
      console.error('사용자 리그 확인 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCompetitions(data || [])
    } catch (error: any) {
      console.error('리그 목록 조회 오류:', error)
    }
  }

  const handleRequestJoin = (competition: Competition) => {
    setSelectedCompetition(competition)
    setShowRequestModal(true)
    setRequestMessage('')
  }

  const submitJoinRequest = async () => {
    if (!selectedCompetition || !user) return

    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('league_join_requests')
        .insert({
          user_id: user.id,
          competition_id: selectedCompetition.id,
          requested_role: 'participant',
          message: requestMessage.trim() || null
        })

      if (error) throw error

      // 신청 목록 새로고침
      await checkUserLeagues()

      setShowRequestModal(false)
      setSelectedCompetition(null)
      alert('리그 참여 신청이 완료되었습니다. 관리자 승인을 기다려주세요.')
    } catch (error: any) {
      console.error('참여 신청 오류:', error)
      alert(error.message || '참여 신청에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const getRequestStatus = (competitionId: string) => {
    return myRequests.find(req => req.competition_id === competitionId)
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <TrophyIcon className="w-16 h-16 text-kopri-blue mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          리그 선택
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          참여하고 싶은 리그를 선택하여 신청해주세요. 관리자 승인 후 리그에 참여할 수 있습니다.
        </p>
      </div>

      {competitions.length === 0 ? (
        <div className="text-center py-12">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            참여 가능한 리그가 없습니다
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            관리자가 리그를 생성하면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => {
            const requestStatus = getRequestStatus(competition.id)
            return (
              <div
                key={competition.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {competition.name}
                    </h3>
                    {requestStatus && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(requestStatus.status)}`}>
                        {getStatusIcon(requestStatus.status)}
                        <span className="ml-1">
                          {requestStatus.status === 'pending' ? '심사중' :
                           requestStatus.status === 'approved' ? '승인됨' : '거부됨'}
                        </span>
                      </span>
                    )}
                  </div>

                  {competition.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {competition.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-6">
                    {competition.start_date && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">시작일:</span> {new Date(competition.start_date).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                    {competition.end_date && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">종료일:</span> {new Date(competition.end_date).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    {requestStatus ? (
                      <div className="space-y-3">
                        {requestStatus.status === 'pending' && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            신청이 접수되었습니다. 관리자 승인을 기다려주세요.
                          </p>
                        )}
                        {requestStatus.status === 'approved' && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            참여 승인되었습니다! 페이지를 새로고침해주세요.
                          </p>
                        )}
                        {requestStatus.status === 'rejected' && (
                          <div className="space-y-2">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              참여 신청이 거부되었습니다.
                            </p>
                            {requestStatus.admin_response && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                관리자 메시지: {requestStatus.admin_response}
                              </p>
                            )}
                            <button
                              onClick={() => handleRequestJoin(competition)}
                              className="w-full bg-kopri-blue hover:bg-kopri-blue/80 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                              다시 신청하기
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequestJoin(competition)}
                        className="w-full bg-kopri-blue hover:bg-kopri-blue/80 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        참여 신청
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 참여 신청 모달 */}
      {showRequestModal && selectedCompetition && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  리그 참여 신청
                </h3>
                <button
                  onClick={() => {
                    setShowRequestModal(false)
                    setSelectedCompetition(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-3 bg-kopri-blue/10 dark:bg-kopri-blue/20 rounded-lg">
                <h4 className="font-medium text-kopri-blue dark:text-kopri-lightblue">
                  {selectedCompetition.name}
                </h4>
                {selectedCompetition.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedCompetition.description}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  신청 메시지 (선택사항)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-kopri-blue focus:border-kopri-blue dark:bg-gray-700 dark:text-white"
                  placeholder="관리자에게 전달할 메시지를 입력해주세요..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false)
                    setSelectedCompetition(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  disabled={submitting}
                >
                  취소
                </button>
                <button
                  onClick={submitJoinRequest}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-kopri-blue hover:bg-kopri-blue/80 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '신청 중...' : '참여 신청'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}