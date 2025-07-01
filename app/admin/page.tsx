'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AdminRoute, { AdminOnly } from '@/components/AdminRoute'
import { 
  TrophyIcon,
  UsersIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

function AdminDashboardContent() {
  const { isSuperAdmin, isRoleAdmin } = useAuth()

  const adminCards = [
    {
      title: '대회 관리',
      description: '대회 생성, 수정, 삭제 및 설정',
      icon: TrophyIcon,
      href: '/admin/competitions',
      color: 'bg-blue-500',
      permission: isSuperAdmin || isRoleAdmin
    },
    {
      title: '사용자 관리',
      description: '사용자 권한 및 역할 관리',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-green-500',
      permission: isSuperAdmin
    },
    {
      title: '데이터 내보내기',
      description: 'JSON, CSV, Excel 형식으로 데이터 내보내기',
      icon: DocumentArrowDownIcon,
      href: '/admin/export',
      color: 'bg-purple-500',
      permission: isSuperAdmin || isRoleAdmin
    },
    {
      title: '시스템 설정',
      description: '시스템 전반적인 설정 관리',
      icon: Cog6ToothIcon,
      href: '/admin/settings',
      color: 'bg-gray-500',
      permission: isSuperAdmin
    },
    {
      title: '통계 대시보드',
      description: '경기, 사용자, 예측 통계',
      icon: ChartBarIcon,
      href: '/admin/stats',
      color: 'bg-yellow-500',
      permission: isSuperAdmin || isRoleAdmin
    }
  ]

  const availableCards = adminCards.filter(card => card.permission)

  return (
    <AdminOnly>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
            <p className="text-gray-600">
              시스템 관리 기능에 접근할 수 있습니다. 권한에 따라 사용 가능한 기능이 제한됩니다.
            </p>
          </div>

          {/* 권한 정보 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">현재 권한</h3>
            <div className="flex flex-wrap gap-2">
              {isSuperAdmin && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  SuperAdmin (최고 관리자)
                </span>
              )}
              {isRoleAdmin && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  CompetitionAdmin (대회 관리자)
                </span>
              )}
            </div>
          </div>

          {/* 관리 기능 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCards.map((card) => {
              const IconComponent = card.icon
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`${card.color} p-3 rounded-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {card.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* 권한 제한 안내 */}
          {availableCards.length < adminCards.length && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">제한된 기능</h3>
              <p className="text-yellow-700 text-sm">
                일부 관리 기능은 SuperAdmin 권한이 필요합니다. 
                추가 권한이 필요한 경우 시스템 관리자에게 문의하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminOnly>
  )
}

export default function AdminDashboard() {
  return (
    <AdminRoute requiredRole="admin">
      <AdminDashboardContent />
    </AdminRoute>
  )
}