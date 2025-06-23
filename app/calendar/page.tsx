'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns'
import { ko } from 'date-fns/locale'

interface CalendarMatch {
  id: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  home_team: { name: string } | null
  away_team: { name: string } | null
}

export default function CalendarPage() {
  const [matches, setMatches] = useState<CalendarMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .not('match_date', 'is', null)
        .order('match_date', { ascending: true })

      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // 일요일 시작
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getMatchesForDay = (date: Date) => {
    return matches.filter(match => 
      isSameDay(new Date(match.match_date), date)
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      scheduled: '예정',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소'
    }

    return (
      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const selectedDateMatches = selectedDate ? getMatchesForDay(selectedDate) : []

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-7 gap-4">
                {[...Array(35)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="w-8 h-8 mr-3 text-kopri-blue" />
            경기 캘린더
          </h1>
          <p className="text-gray-600 mt-2">제 1회 KOPRI CUP 경기 일정을 달력으로 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 캘린더 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* 캘린더 헤더 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentDate, 'yyyy년 M월', { locale: ko })}
                </h2>
                
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div 
                    key={day} 
                    className={`p-3 text-center text-sm font-medium ${
                      index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 캘린더 그리드 */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, dayIndex) => {
                  const dayMatches = getMatchesForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isTodayDate = isToday(day)

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                      } ${isSelected ? 'bg-kopri-blue bg-opacity-10 border-kopri-blue' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isTodayDate ? 'bg-kopri-blue text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                      }`}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* 경기 목록 */}
                      <div className="space-y-1">
                        {dayMatches.slice(0, 3).map((match) => (
                          <Link
                            key={match.id}
                            href={`/matches/${match.id}`}
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className={`text-xs p-1 rounded ${
                              match.status === 'completed' ? 'bg-green-100 text-green-800' :
                              match.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              match.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            } hover:opacity-80 transition-opacity`}>
                              <div className="font-medium truncate">
                                {match.home_team?.name || '미정'} vs {match.away_team?.name || '미정'}
                              </div>
                              <div className="flex items-center text-xs">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {format(new Date(match.match_date), 'HH:mm')}
                              </div>
                            </div>
                          </Link>
                        ))}
                        
                        {dayMatches.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayMatches.length - 3}개 더
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 사이드바 - 선택된 날짜 상세 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDate ? format(selectedDate, 'M월 d일 (EEE)', { locale: ko }) : '날짜를 선택하세요'}
                </h3>
              </div>
              
              <div className="p-6">
                {!selectedDate ? (
                  <div className="text-center text-gray-500 py-8">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>달력에서 날짜를 클릭하면<br />해당 날짜의 경기를<br />확인할 수 있습니다</p>
                  </div>
                ) : selectedDateMatches.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>이 날에는<br />예정된 경기가<br />없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateMatches.map((match) => (
                      <Link
                        key={match.id}
                        href={`/matches/${match.id}`}
                        className="block border rounded-lg p-4 hover:border-kopri-blue hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {match.home_team?.name || '미정'} vs {match.away_team?.name || '미정'}
                          </div>
                          {getStatusBadge(match.status)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {format(new Date(match.match_date), 'HH:mm')}
                        </div>

                        {match.status === 'completed' && match.home_score !== null && match.away_score !== null && (
                          <div className="text-lg font-bold text-kopri-blue">
                            {match.home_score} - {match.away_score}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 캘린더 범례 */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">범례</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">예정된 경기</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">진행중인 경기</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">완료된 경기</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">취소된 경기</span>
                </div>
                <div className="flex items-center pt-2 border-t border-gray-200">
                  <div className="w-4 h-4 bg-kopri-blue rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">오늘</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}