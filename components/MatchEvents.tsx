'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClockIcon, FireIcon, HandRaisedIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface MatchEvent {
  id: string
  type: 'goal' | 'assist' | 'substitution' | 'card'
  player_id: string
  assist_player_id?: string
  team_id: string
  minute: number
  description?: string
  created_at: string
  player: {
    id: string
    name: string
  }
  assist_player?: {
    id: string
    name: string
  }
  team: {
    id: string
    name: string
  }
}

interface MatchEventsProps {
  matchId: string
  homeTeamId: string
  awayTeamId: string
  homeTeamName: string
  awayTeamName: string
}

export default function MatchEvents({ 
  matchId, 
  homeTeamId, 
  awayTeamId, 
  homeTeamName, 
  awayTeamName 
}: MatchEventsProps) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatchEvents()
    
    // 실시간 이벤트 업데이트 구독
    const channel = supabase
      .channel(`match_events_${matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_events',
        filter: `match_id=eq.${matchId}`
      }, () => {
        loadMatchEvents()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  const loadMatchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          id,
          type,
          player_id,
          assist_player_id,
          team_id,
          minute,
          description,
          created_at,
          player:players!match_events_player_id_fkey(id, name),
          assist_player:players!match_events_assist_player_id_fkey(id, name),
          team:teams!match_events_team_id_fkey(id, name)
        `)
        .eq('match_id', matchId)
        .in('type', ['goal', 'assist'])
        .order('minute', { ascending: true })

      if (error) {
        console.error('Error loading match events:', error)
        return
      }

      // Supabase 조인 결과 처리
      const processedEvents: MatchEvent[] = (data || []).map(event => ({
        ...event,
        player: Array.isArray(event.player) ? event.player[0] : event.player,
        assist_player: Array.isArray(event.assist_player) ? event.assist_player[0] : event.assist_player,
        team: Array.isArray(event.team) ? event.team[0] : event.team
      }))
      
      setEvents(processedEvents)
    } catch (error) {
      console.error('Error loading match events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <FireIcon className="w-5 h-5 text-red-500" />
      case 'assist':
        return <HandRaisedIcon className="w-5 h-5 text-blue-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
      case 'assist':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const groupEventsByMinute = () => {
    const grouped: { [minute: number]: MatchEvent[] } = {}
    
    events.forEach(event => {
      if (!grouped[event.minute]) {
        grouped[event.minute] = []
      }
      grouped[event.minute].push(event)
    })
    
    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([minute, events]) => ({ minute: parseInt(minute), events }))
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          경기 이벤트
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">아직 기록된 이벤트가 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <ClockIcon className="w-5 h-5 mr-2" />
        경기 이벤트
      </h3>
      
      <div className="space-y-4">
        {groupEventsByMinute().map(({ minute, events }) => (
          <div key={minute} className="relative">
            {/* 시간 표시 */}
            <div className="flex items-center mb-2">
              <div className="bg-kopri-blue text-white px-2 py-1 rounded text-sm font-medium">
                {minute}'
              </div>
            </div>
            
            {/* 이벤트들 */}
            <div className="space-y-2 ml-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg p-3 ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* 이벤트 아이콘 */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventIcon(event.type)}
                    </div>
                    
                    {/* 이벤트 내용 */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Link 
                              href={`/players/${event.player_id}`}
                              className="font-medium text-gray-900 dark:text-gray-100 hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
                            >
                              {event.player?.name}
                            </Link>
                            <span className={`text-sm px-2 py-1 rounded ${
                              event.team_id === homeTeamId 
                                ? 'bg-kopri-blue/10 text-kopri-blue dark:bg-kopri-lightblue/10 dark:text-kopri-lightblue' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {event.team_id === homeTeamId ? homeTeamName : awayTeamName}
                            </span>
                          </div>
                          
                          {/* 어시스트 정보 (골 이벤트에서 어시스트가 있는 경우) */}
                          {event.type === 'goal' && event.assist_player && (
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              어시스트: <Link 
                                href={`/players/${event.assist_player_id}`}
                                className="hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
                              >
                                {event.assist_player.name}
                              </Link>
                            </div>
                          )}
                          
                          {/* 설명 */}
                          {event.description && (
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {event.description}
                            </div>
                          )}
                        </div>
                        
                        {/* 이벤트 타입 */}
                        <div className="text-right">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            event.type === 'goal' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {event.type === 'goal' ? '골' : '어시스트'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}