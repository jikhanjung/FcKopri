'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import AdminRoute from '@/components/AdminRoute'

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
}

function AdminUsersPageContent() {
  const { isSuperAdmin, isRoleAdmin, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !isSuperAdmin && !isRoleAdmin) {
      setError('권한이 없습니다.')
      setLoading(false)
      return
    }

    if (!authLoading) {
      fetchUsers()
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

      // 각 사용자의 권한 조회
      const usersWithRoles: User[] = []
      for (const profile of profiles) {
        const { data: roles } = await supabase.rpc('get_user_roles', {
          user_uuid: profile.id
        })
        
        usersWithRoles.push({
          ...profile,
          roles: roles || []
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

  const grantRole = async (userId: string, role: 'moderator' | 'admin' | 'super_admin') => {
    try {
      const { error } = await supabase.rpc('grant_user_role', {
        target_user_id: userId,
        new_role: role,
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
      const { error } = await supabase.rpc('revoke_user_role', {
        target_user_id: userId,
        role_to_revoke: role,
        reason: `관리자 페이지에서 ${role} 권한 취소`
      })

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
                  가입일
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    권한 관리
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!user.roles.some(r => r.role === 'moderator') && (
                          <button
                            onClick={() => grantRole(user.id, 'moderator')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            운영자
                          </button>
                        )}
                        {!user.roles.some(r => r.role === 'admin') && (
                          <button
                            onClick={() => grantRole(user.id, 'admin')}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          >
                            관리자
                          </button>
                        )}
                        {user.roles.some(r => r.role === 'moderator') && (
                          <button
                            onClick={() => revokeRole(user.id, 'moderator')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            운영자 취소
                          </button>
                        )}
                        {user.roles.some(r => r.role === 'admin') && (
                          <button
                            onClick={() => revokeRole(user.id, 'admin')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            관리자 취소
                          </button>
                        )}
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