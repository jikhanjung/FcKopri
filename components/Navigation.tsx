'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  TrophyIcon,
  LockClosedIcon,
  LockOpenIcon,
  FireIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  PresentationChartBarIcon
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
      { name: '캘린더', href: '/calendar' },
      { name: '플레이오프', href: '/playoffs' }
    ]
  },
  { 
    name: '순위', 
    href: '/standings', 
    icon: TrophyIcon,
    subItems: [
      { name: '팀 순위', href: '/standings' },
      { name: '개인 순위', href: '/standings/players' }
    ]
  },
  { 
    name: '예측', 
    href: '/predictions', 
    icon: PresentationChartBarIcon,
    subItems: [
      { name: '경기 결과 맞히기', href: '/predictions' },
      { name: '우승팀 투표', href: '/champion' }
    ]
  },
]

export default function Navigation() {
  const pathname = usePathname()
  const { isAdmin, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-kopri-blue dark:text-kopri-lightblue">
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
                      >
                        <item.icon className="w-5 h-5 mr-2" />
                        {item.name}
                        <ChevronDownIcon className="w-3 h-3 ml-1" />
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
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
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
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* 검색 및 어드민 버튼 */}
          <div className="flex items-center space-x-4">
            {/* 전역 검색 */}
            <div className="hidden md:block w-48">
              <GlobalSearch />
            </div>
            
            {/* 알림 */}
            <NotificationBell />
            
            {/* 테마 토글 */}
            <ThemeToggle size="md" />
            
            {/* 어드민 버튼 */}
            <div className="hidden sm:flex items-center space-x-4">
              {isAdmin ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/admin/export"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                    title="데이터 내보내기"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </Link>
                  <span className="text-sm text-gray-600 dark:text-gray-300 bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                    관리자
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                  >
                    <LockOpenIcon className="w-5 h-5 mr-1" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/admin/login"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                >
                  <LockClosedIcon className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">관리자</span>
                </Link>
              )}
            </div>

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
            
            {/* 모바일 어드민 버튼 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              {isAdmin ? (
                <div className="flex items-center justify-between pl-3 pr-4 py-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300 bg-green-100 dark:bg-green-800 px-3 py-1 rounded">
                    관리자 모드
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full flex items-center"
                  >
                    <LockOpenIcon className="w-5 h-5 mr-2" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium"
                >
                  <div className="flex items-center">
                    <LockClosedIcon className="w-6 h-6 mr-3" />
                    관리자 로그인
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}