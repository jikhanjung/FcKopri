'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { UserGroupIcon, ShieldCheckIcon, CogIcon, PlusIcon } from '@heroicons/react/24/outline'
import AdminRoute from '@/components/AdminRoute'
import { Competition, UserCompetitionRelation } from '@/types'

interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  roles: {
    role: 'user' | 'moderator' | 'admin' | 'super_admin'
    expires_at: string | null
  }[]
  competitions: UserCompetitionRelation[]
}

function AdminUsersPageContent() {
  const { isSuperAdmin, isRoleAdmin, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCompetitionModal, setShowCompetitionModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !isSuperAdmin && !isRoleAdmin) {
      setError('권한이 없습니다.')
      setLoading(false)
      return
    }

    if (!authLoading) {
      fetchUsers()
      fetchCompetitions()
    }
  }, [authLoading, isSuperAdmin, isRoleAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // 사용자 목록과 권한을 함께 조회
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          display_name,
          avatar_url,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (profileError) throw profileError

      // 각 사용자의 권한 및 대회 관계 조회
      const usersWithRoles: User[] = []
      for (const profile of profiles) {
        // 사용자 권한 직접 조회
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role, expires_at')
          .eq('user_id', profile.id)
        
        // 사용자의 대회 관계 조회
        const { data: userCompetitions } = await supabase
          .from('user_competition_relations')
          .select('*')
          .eq('user_id', profile.id)
        
        usersWithRoles.push({
          ...profile,
          roles: roles || [],
          competitions: userCompetitions || []
        })
      }

      setUsers(usersWithRoles)
    } catch (error: any) {
      console.error('사용자 목록 조회 오류:', error)
      setError(error.message || '사용자 목록을 불러올 수 없습니다.')
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
      console.error('대회 목록 조회 오류:', error)
    }
  }

  const addUserToCompetition = async (userId: string, competitionId: string, role: 'participant' | 'admin' | 'moderator' = 'participant') => {
    try {
      const { error } = await supabase
        .from('user_competition_relations')
        .insert({
          user_id: userId,
          competition_id: competitionId,
          role: role
        })

      if (error) throw error

      await fetchUsers() // 목록 새로고침
      alert('사용자가 대회에 추가되었습니다.')
    } catch (error: any) {
      console.error('대회 추가 오류:', error)
      alert(error.message || '대회 추가에 실패했습니다.')
    }
  }

  const removeUserFromCompetition = async (userId: string, competitionId: string) => {
    try {
      const { error } = await supabase
        .from('user_competition_relations')
        .delete()
        .eq('user_id', userId)
        .eq('competition_id', competitionId)

      if (error) throw error

      await fetchUsers() // 목록 새로고침
      alert('사용자가 대회에서 제거되었습니다.')
    } catch (error: any) {
      console.error('대회 제거 오류:', error)
      alert(error.message || '대회 제거에 실패했습니다.')
    }
  }

  const grantRole = async (userId: string, role: 'moderator' | 'admin' | 'super_admin') => {
    try {
      // 직접 SQL로 권한 부여
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          granted_by: null, // 관리자 페이지에서 부여
          reason: `관리자 페이지에서 ${role} 권한 부여`
        })

      if (error) throw error

      await fetchUsers() // 목록 새로고침
      alert(`${role} 권한이 부여되었습니다.`)
    } catch (error: any) {
      console.error('권한 부여 오류:', error)
      alert(error.message || '권한 부여에 실패했습니다.')
    }
  }

  const revokeRole = async (userId: string, role: 'moderator' | 'admin' | 'super_admin') => {
    try {
      // 직접 SQL로 권한 취소
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)

      if (error) throw error

      await fetchUsers() // 목록 새로고침
      alert(`${role} 권한이 취소되었습니다.`)
    } catch (error: any) {
      console.error('권한 취소 오류:', error)
      alert(error.message || '권한 취소에 실패했습니다.')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return '슈퍼관리자'
      case 'admin': return '관리자'
      case 'moderator': return '운영자'
      default: return '사용자'
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
          <UserGroupIcon className="w-8 h-8 text-kopri-blue" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            사용자 권한 관리
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          등록된 사용자들의 권한을 관리할 수 있습니다.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  현재 권한
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  참여 대회
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  가입일
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    관리
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="프로필"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                          <UserGroupIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.display_name || '이름 없음'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role.role)}`}
                          >
                            <ShieldCheckIcon className="w-3 h-3 mr-1" />
                            {getRoleDisplayName(role.role)}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          일반 사용자
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.competitions.length > 0 ? (
                        user.competitions.map((relation) => {
                          const competition = competitions.find(c => c.id === relation.competition_id)
                          return (
                            <span
                              key={relation.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-kopri-blue/10 text-kopri-blue dark:bg-kopri-lightblue/10 dark:text-kopri-lightblue"
                              title={`역할: ${relation.role}`}
                            >
                              {competition?.name || '알 수 없는 대회'}
                            </span>
                          )
                        })
                      ) : (
                        <span className="text-xs text-gray-400">참여 대회 없음</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {/* 권한 관리 */}
                        <div className="flex space-x-2">
                          {!user.roles.some(r => r.role === 'moderator') && (
                            <button
                              onClick={() => grantRole(user.id, 'moderator')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                            >
                              운영자
                            </button>
                          )}
                          {!user.roles.some(r => r.role === 'admin') && (
                            <button
                              onClick={() => grantRole(user.id, 'admin')}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 text-xs"
                            >
                              관리자
                            </button>
                          )}
                          {user.roles.some(r => r.role === 'moderator') && (
                            <button
                              onClick={() => revokeRole(user.id, 'moderator')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs"
                            >
                              운영자 취소
                            </button>
                          )}
                          {user.roles.some(r => r.role === 'admin') && (
                            <button
                              onClick={() => revokeRole(user.id, 'admin')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs"
                            >
                              관리자 취소
                            </button>
                          )}
                        </div>
                        
                        {/* 대회 관리 */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowCompetitionModal(true)
                            }}
                            className="inline-flex items-center text-kopri-blue hover:text-kopri-blue/80 dark:text-kopri-lightblue dark:hover:text-kopri-lightblue/80 text-xs"
                          >
                            <CogIcon className="w-3 h-3 mr-1" />
                            대회 관리
                          </button>
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              등록된 사용자가 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              사용자가 로그인하면 이곳에 표시됩니다.
            </p>
          </div>
        )}
      </div>

      {/* 대회 관리 모달 */}
      {showCompetitionModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  대회 관리 - {selectedUser.display_name || selectedUser.email}
                </h3>
                <button
                  onClick={() => {
                    setShowCompetitionModal(false)
                    setSelectedUser(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* 현재 참여 중인 대회 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  현재 참여 중인 대회
                </h4>
                {selectedUser.competitions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.competitions.map((relation) => {
                      const competition = competitions.find(c => c.id === relation.competition_id)
                      return (
                        <div key={relation.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {competition?.name || '알 수 없는 대회'}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({relation.role})
                            </span>
                          </div>
                          <button
                            onClick={() => removeUserFromCompetition(selectedUser.id, relation.competition_id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
                          >
                            제거
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">참여 중인 대회가 없습니다.</p>
                )}
              </div>

              {/* 대회 추가 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  대회 추가
                </h4>
                <div className="space-y-2">
                  {competitions.filter(comp => 
                    !selectedUser.competitions.some(rel => rel.competition_id === comp.id)
                  ).map((competition) => (
                    <div key={competition.id} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {competition.name}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => addUserToCompetition(selectedUser.id, competition.id, 'participant')}
                          className="px-2 py-1 text-xs bg-kopri-blue text-white rounded hover:bg-kopri-blue/80"
                        >
                          참가자
                        </button>
                        <button
                          onClick={() => addUserToCompetition(selectedUser.id, competition.id, 'admin')}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          관리자
                        </button>
                      </div>
                    </div>
                  ))}
                  {competitions.filter(comp => 
                    !selectedUser.competitions.some(rel => rel.competition_id === comp.id)
                  ).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">추가할 수 있는 대회가 없습니다.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowCompetitionModal(false)
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminRoute requiredRole="super_admin">
      <AdminUsersPageContent />
    </AdminRoute>
  )
}