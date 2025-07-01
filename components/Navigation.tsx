'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  TrophyIcon,
  LockOpenIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  PresentationChartBarIcon,
  CogIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import GlobalSearch from './GlobalSearch'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import { useState } from 'react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: { name: string; href: string }[]
}

const navigation: NavigationItem[] = [
  { name: '홈', href: '/', icon: HomeIcon },
  { name: '팀', href: '/teams', icon: UserGroupIcon },
  { 
    name: '경기', 
    href: '/matches', 
    icon: CalendarIcon,
    subItems: [
      { name: '경기 일정', href: '/matches' },
      { name: '캘린더', href: '/calendar' }
    ]
  },
  { 
    name: '순위', 
    href: '/standings', 
    icon: TrophyIcon,
    subItems: [
      { name: '팀 순위', href: '/standings' },
      { name: '개인 순위', href: '/standings/players' },
      { name: '시상식', href: '/awards' }
    ]
  },
  { 
    name: '투표', 
    href: '/predictions', 
    icon: PresentationChartBarIcon,
    subItems: [
      { name: '경기 결과 맞히기', href: '/predictions' },
      { name: '우승팀 맞히기', href: '/champion' },
      { name: 'MVP 투표', href: '/awards?tab=vote-mvp' },
      { name: '베스트6 투표', href: '/awards?tab=vote-best6' }
    ]
  },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut, isRoleAdmin, isSuperAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-800 shadow" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-kopri-blue dark:text-kopri-lightblue" data-testid="logo-link">
                KOPRI CUP
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = item.subItems 
                  ? item.subItems.some(sub => pathname === sub.href)
                  : pathname === item.href
                
                const linkClasses = `${
                  isActive
                    ? 'border-kopri-blue text-kopri-blue dark:border-kopri-lightblue dark:text-kopri-lightblue'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-200'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                
                if (item.subItems) {
                  return (
                    <div key={item.name} className="relative group inline-flex">
                      <Link
                        href={item.href}
                        className={linkClasses}
                        data-testid={`nav-${item.name.toLowerCase()}`}
                      >
                        <item.icon className="w-5 h-5 mr-2" />
                        {item.name}
                        <ChevronDownIcon className="w-4 h-4 ml-1" />
                      </Link>
                      
                      {/* 드롭다운 메뉴 */}
                      <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`${
                                pathname === subItem.href
                                  ? 'bg-gray-100 dark:bg-gray-700 text-kopri-blue dark:text-kopri-lightblue'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              } block px-4 py-2 text-sm`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={linkClasses}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* 검색 및 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {/* 전역 검색 */}
            <div className="hidden md:block w-48">
              <GlobalSearch />
            </div>

            {/* 알림 벨 */}
            <NotificationBell />
            
            {/* 테마 토글 */}
            <ThemeToggle size="md" />
            
            {/* 사용자 로그인 상태 */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* 사용자 드롭다운 메뉴 */}
                <div className="relative group">
                  <div className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1 transition-colors cursor-pointer">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="프로필"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block hover:text-kopri-blue dark:hover:text-kopri-lightblue">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 hidden sm:block" />
                  </div>
                  
                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <UserIcon className="w-4 h-4 mr-3" />
                        내 프로필
                      </Link>
                      
                      {(isRoleAdmin || isSuperAdmin) && (
                        <>
                          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                          <div className="px-4 py-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              관리자 메뉴
                            </span>
                          </div>
                          <Link
                            href="/admin/competition"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <CogIcon className="w-4 h-4 mr-3" />
                            대회 설정
                          </Link>
                          <Link
                            href="/admin/export"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-3" />
                            데이터 내보내기
                          </Link>
                          {isSuperAdmin && (
                            <Link
                              href="/admin/users"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ShieldCheckIcon className="w-4 h-4 mr-3" />
                              사용자 권한 관리
                            </Link>
                          )}
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      <button
                        onClick={signOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        <LockOpenIcon className="w-4 h-4 mr-3" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-kopri-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-kopri-blue/80 transition-colors"
                data-testid="user-login-button"
              >
                로그인
              </Link>
            )}

            {/* 모바일 메뉴 버튼 */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-kopri-blue"
              >
                <span className="sr-only">메뉴 열기</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
            {/* 모바일 검색 */}
            <div className="px-3 pb-2">
              <GlobalSearch />
            </div>
          
            {navigation.map((item) => {
              const isActive = item.subItems 
                ? item.subItems.some(sub => pathname === sub.href)
                : pathname === item.href
              
              if (item.subItems) {
                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        isActive
                          ? 'bg-kopri-blue text-white dark:bg-kopri-lightblue'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                      } block pl-3 pr-4 py-3 border-l-4 text-base font-medium ${
                        isActive ? 'border-kopri-blue' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="w-6 h-6 mr-3" />
                        {item.name}
                      </div>
                    </Link>
                    {/* 서브메뉴 */}
                    <div className="pl-10">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`${
                            pathname === subItem.href
                              ? 'text-kopri-blue dark:text-kopri-lightblue font-medium'
                              : 'text-gray-500 dark:text-gray-400'
                          } block py-2 text-sm hover:text-gray-900 dark:hover:text-gray-100`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    isActive
                      ? 'bg-kopri-blue text-white dark:bg-kopri-lightblue'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  } block pl-3 pr-4 py-3 border-l-4 text-base font-medium ${
                    isActive ? 'border-kopri-blue' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-6 h-6 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
            
            {/* 모바일 테마 토글 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 pb-2">
              <div className="flex items-center justify-between pl-3 pr-4 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">테마 설정</span>
                <ThemeToggle size="md" />
              </div>
            </div>

            {/* 모바일 사용자 로그인 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              {user ? (
                <div className="pl-3 pr-4 py-3">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                  >
                    {user.user_metadata?.avatar_url && (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="프로필"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        프로필 보기
                      </div>
                    </div>
                  </Link>
                  <div className="mt-2 pl-2">
                    <button
                      onClick={signOut}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block mx-3 my-2 bg-kopri-blue text-white text-center py-3 rounded-lg font-medium hover:bg-kopri-blue/80 transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}