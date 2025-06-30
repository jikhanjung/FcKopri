'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface MatchEvent {
  id: string
  type: 'goal' | 'assist' | 'substitution' | 'card'
  player_id: string
  assist_player_id?: string
  team_id: string
  minute: number
  description?: string
  player: {
    id: string
    name: string
  }
  assist_player?: {
    id: string
    name: string
  }
}

interface MatchScoreEventsProps {
  matchId: string
  homeTeamId: string
  awayTeamId: string
}

export default function MatchScoreEvents({ 
  matchId, 
  homeTeamId, 
  awayTeamId 
}: MatchScoreEventsProps) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatchEvents()
    
    // 실시간 이벤트 업데이트 구독
    const channel = supabase
      .channel(`score_events_${matchId}`)
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
          player:players!match_events_player_id_fkey(id, name),
          assist_player:players!match_events_assist_player_id_fkey(id, name)
        `)
        .eq('match_id', matchId)
        .in('type', ['goal', 'card']) // 골과 카드(경고/퇴장)만 표시
        .order('minute', { ascending: true })

      if (error) {
        console.error('Error loading match events:', error)
        return
      }

      // Supabase 조인 결과 처리
      const processedEvents: MatchEvent[] = (data || []).map(event => ({
        ...event,
        player: Array.isArray(event.player) ? event.player[0] : event.player,
        assist_player: Array.isArray(event.assist_player) ? event.assist_player[0] : event.assist_player
      }))
      
      setEvents(processedEvents)
    } catch (error) {
      console.error('Error loading match events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string, description?: string) => {
    if (type === 'goal') {
      if (description === '자책골') {
        return '🥅' // 자책골 아이콘
      }
      return '⚽' // 축구공 아이콘
    }
    if (type === 'card') {
      // description에 따라 경고/퇴장 구분
      if (description?.includes('퇴장') || description?.includes('red')) {
        return '🟥' // 빨간카드
      }
      return '🟨' // 노란카드 (기본)
    }
    return '⏱️'
  }

  const getAssistIcon = () => {
    return '👟' // 신발 아이콘 (어시스트)
  }

  const getEventText = (type: string, description?: string) => {
    if (type === 'goal') return '득점'
    if (type === 'card') {
      if (description?.includes('퇴장') || description?.includes('red')) {
        return '퇴장'
      }
      return '경고'
    }
    return ''
  }

  // 팀별로 이벤트 분리
  const homeEvents = events.filter(event => event.team_id === homeTeamId)
  const awayEvents = events.filter(event => event.team_id === awayTeamId)

  if (loading || events.length === 0) {
    return null
  }

  const EventList = ({ events, isHome }: { events: MatchEvent[], isHome: boolean }) => (
    <div className={`space-y-2 ${isHome ? 'text-left' : 'text-right'}`}>
      {events.map((event) => (
        <div 
          key={event.id} 
          className={`text-sm text-gray-600 dark:text-gray-400`}
        >
          {isHome ? (
            // 홈팀: 왼쪽 정렬, 정상 순서
            <div className="flex items-center space-x-1">
              <span className="font-medium">{event.minute}'</span>
              <span>{getEventIcon(event.type, event.description)}</span>
              <Link 
                href={`/players/${event.player_id}`}
                className="font-medium text-gray-900 dark:text-gray-100 hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
              >
                {event.player?.name}
              </Link>
              {event.description === '자책골' && (
                <span className="text-xs text-orange-600 dark:text-orange-400">(OG)</span>
              )}
              {event.type === 'goal' && event.assist_player && (
                <>
                  <span>(</span>
                  <span>{getAssistIcon()}</span>
                  <Link 
                    href={`/players/${event.assist_player_id}`}
                    className="font-medium text-gray-700 dark:text-gray-300 hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
                  >
                    {event.assist_player.name}
                  </Link>
                  <span>)</span>
                </>
              )}
              {event.type === 'card' && (
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {getEventText(event.type, event.description)}
                </span>
              )}
            </div>
          ) : (
            // 원정팀: 오른쪽 정렬, 특별한 순서
            <div className="flex items-center justify-end space-x-1">
              <span>{getEventIcon(event.type, event.description)}</span>
              <Link 
                href={`/players/${event.player_id}`}
                className="font-medium text-gray-900 dark:text-gray-100 hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
              >
                {event.player?.name}
              </Link>
              {event.description === '자책골' && (
                <span className="text-xs text-orange-600 dark:text-orange-400">(OG)</span>
              )}
              {event.type === 'goal' && event.assist_player && (
                <>
                  <span>(</span>
                  <span>{getAssistIcon()}</span>
                  <Link 
                    href={`/players/${event.assist_player_id}`}
                    className="font-medium text-gray-700 dark:text-gray-300 hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
                  >
                    {event.assist_player.name}
                  </Link>
                  <span>)</span>
                </>
              )}
              <span className="font-medium">{event.minute}'</span>
              {event.type === 'card' && (
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {getEventText(event.type, event.description)}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-2 gap-8">
        {/* 홈팀 이벤트 */}
        <div>
          <EventList events={homeEvents} isHome={true} />
        </div>
        
        {/* 원정팀 이벤트 */}
        <div>
          <EventList events={awayEvents} isHome={false} />
        </div>
      </div>
    </div>
  )
}