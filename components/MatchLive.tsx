'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { AdminOnly } from '@/components/AdminRoute'

interface Player {
  id: string
  name: string
  team_id: string
}

interface Team {
  id: string
  name: string
  players: Player[]
}

interface MatchEvent {
  id: string
  match_id: string
  type: 'goal' | 'assist' | 'substitution' | 'card'
  player_id: string
  assist_player_id?: string
  team_id: string
  minute: number
  description?: string
  half?: 'first' | 'second'
  created_at: string
}

interface MatchLiveProps {
  matchId: string
  homeTeam: Team
  awayTeam: Team
  onScoreUpdate: (homeScore: number, awayScore: number) => void
}

export default function MatchLive({ matchId, homeTeam, awayTeam, onScoreUpdate }: MatchLiveProps) {
  const [isLive, setIsLive] = useState(false)
  const [currentTime, setCurrentTime] = useState(0) // 초 단위로 저장
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  
  // 골 입력 모달 상태
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home')
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [assistPlayer, setAssistPlayer] = useState('')
  const [eventMinute, setEventMinute] = useState(Math.floor(currentTime / 60))
  const [isOwnGoal, setIsOwnGoal] = useState(false)
  
  // 전반/후반 상태
  const [currentHalf, setCurrentHalf] = useState<'first' | 'second'>('first')
  const [halfDuration, setHalfDuration] = useState(45) // 기본값 45분

  useEffect(() => {
    loadMatchEvents()
    loadCompetitionSettings()
  }, [matchId])

  const loadCompetitionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('half_duration_minutes')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.warn('Could not load competition settings:', error)
        return
      }

      if (data?.half_duration_minutes) {
        setHalfDuration(data.half_duration_minutes)
      }
    } catch (error) {
      console.warn('Error loading competition settings:', error)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000) // 1초마다 증가
    }
    return () => clearInterval(interval)
  }, [isLive])

  const loadMatchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('minute', { ascending: true })

      if (error) throw error

      setEvents(data || [])
      
      // 점수 계산
      const homeGoals = data?.filter(e => e.type === 'goal' && e.team_id === homeTeam.id).length || 0
      const awayGoals = data?.filter(e => e.type === 'goal' && e.team_id === awayTeam.id).length || 0
      
      setHomeScore(homeGoals)
      setAwayScore(awayGoals)
      onScoreUpdate(homeGoals, awayGoals)
    } catch (error) {
      console.error('Error loading match events:', error)
      setEvents([])
      setHomeScore(0)
      setAwayScore(0)
      onScoreUpdate(0, 0)
    }
  }

  const startMatch = () => {
    setIsLive(true)
    // 전반이면 0초부터, 후반이면 전반 시간만큼 경과된 시점부터 시작
    setCurrentTime(currentHalf === 'first' ? 0 : halfDuration * 60)
  }

  const pauseMatch = () => {
    setIsLive(false)
  }

  const endMatch = async () => {
    setIsLive(false)
    
    // 경기 상태를 완료로 업데이트
    try {
      await supabase
        .from('matches')
        .update({
          status: 'completed',
          home_score: homeScore,
          away_score: awayScore
        })
        .eq('id', matchId)
      
      onScoreUpdate(homeScore, awayScore)
    } catch (error) {
      console.error('Error ending match:', error)
    }
  }

  const addGoal = async () => {
    if (!selectedPlayer) return

    try {
      // selectedTeam은 득점하는 팀을 의미 (자책골 여부와 관계없이)
      const scoringTeamId = selectedTeam === 'home' ? homeTeam.id : awayTeam.id
      
      const newEvent = {
        match_id: matchId,
        type: 'goal' as const,
        player_id: selectedPlayer,
        assist_player_id: isOwnGoal ? null : (assistPlayer || null),
        team_id: scoringTeamId,
        minute: eventMinute,
        description: isOwnGoal ? '자책골' : null,
        half: currentHalf
      }

      const { error } = await supabase
        .from('match_events')
        .insert([newEvent])

      if (error) throw error

      // 어시스트가 있으면 어시스트 이벤트도 추가 (자책골이 아닌 경우에만)
      if (!isOwnGoal && assistPlayer) {
        const assistEvent = {
          match_id: matchId,
          type: 'assist' as const,
          player_id: assistPlayer,
          team_id: selectedTeam === 'home' ? homeTeam.id : awayTeam.id,
          minute: eventMinute,
          description: '어시스트',
          half: currentHalf
        }

        await supabase
          .from('match_events')
          .insert([assistEvent])
      }

      // 모달 닫기 및 초기화
      setShowGoalModal(false)
      setSelectedPlayer('')
      setAssistPlayer('')
      setIsOwnGoal(false)
      
      // 이벤트 다시 로드
      loadMatchEvents()
      
      alert(isOwnGoal ? '자책골이 추가되었습니다!' : '골이 추가되었습니다!')
    } catch (error) {
      console.error('Error adding goal:', error)
      alert('골 추가 중 오류가 발생했습니다.')
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId)
      
      loadMatchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const getPlayerName = (playerId: string) => {
    const allPlayers = [...homeTeam.players, ...awayTeam.players]
    return allPlayers.find(p => p.id === playerId)?.name || '알 수 없음'
  }

  const getTeamName = (teamId: string) => {
    if (teamId === homeTeam.id) return homeTeam.name
    if (teamId === awayTeam.id) return awayTeam.name
    return '알 수 없음'
  }

  return (
    <AdminOnly>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* 경기 제어 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            실시간 경기 진행
          </h3>
          
          <div className="flex items-center space-x-4">
            {/* 전반/후반 선택 */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => {
                  setCurrentHalf('first')
                  if (!isLive) {
                    setCurrentTime(0)
                  }
                }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  currentHalf === 'first'
                    ? 'bg-kopri-blue text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                전반
              </button>
              <button
                onClick={() => {
                  setCurrentHalf('second')
                  if (!isLive) {
                    setCurrentTime(halfDuration * 60) // 후반 시작 시간으로 설정
                  }
                }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  currentHalf === 'second'
                    ? 'bg-kopri-blue text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                후반
              </button>
            </div>
            
            <div className="flex items-center text-lg font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
              <ClockIcon className="w-5 h-5 mr-2" />
              {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{(currentTime % 60).toString().padStart(2, '0')}
            </div>
            
            {!isLive ? (
              <button
                onClick={startMatch}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                시작
              </button>
            ) : (
              <button
                onClick={pauseMatch}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <PauseIcon className="w-4 h-4 mr-2" />
                일시정지
              </button>
            )}
            
            <button
              onClick={endMatch}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <StopIcon className="w-4 h-4 mr-2" />
              종료
            </button>
          </div>
        </div>

        {/* 현재 스코어 */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {homeTeam.name} {homeScore} - {awayScore} {awayTeam.name}
          </div>
        </div>

        {/* 골 추가 버튼 */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => {
              setSelectedTeam('home')
              // 경기 진행 중이면 현재 분+1, 아니면 현재 시간의 분
              const minute = isLive ? Math.floor(currentTime / 60) + 1 : Math.floor(currentTime / 60)
              setEventMinute(minute)
              setShowGoalModal(true)
            }}
            className="flex items-center px-4 py-2 bg-kopri-blue text-white rounded-lg hover:bg-kopri-blue/90"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {homeTeam.name} 득점
          </button>
          
          <button
            onClick={() => {
              setSelectedTeam('away')
              // 경기 진행 중이면 현재 분+1, 아니면 현재 시간의 분
              const minute = isLive ? Math.floor(currentTime / 60) + 1 : Math.floor(currentTime / 60)
              setEventMinute(minute)
              setShowGoalModal(true)
            }}
            className="flex items-center px-4 py-2 bg-kopri-blue text-white rounded-lg hover:bg-kopri-blue/90"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {awayTeam.name} 득점
          </button>
        </div>

        {/* 경기 이벤트 목록 */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">경기 이벤트</h4>
          
          {events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              아직 이벤트가 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {event.minute}'
                    </span>
                    <span className="text-2xl">
                      {event.type === 'goal' ? (event.description === '자책골' ? '🥅' : '⚽') : event.type === 'assist' ? '🅰️' : '📝'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {getPlayerName(event.player_id)} ({getTeamName(event.team_id)})
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.half === 'first' ? '전반' : '후반'} {event.minute}'
                        {event.description && ` - ${event.description}`}
                        {event.description === '자책골' && ' (상대팀 득점)'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 골 추가 모달 */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {selectedTeam === 'home' ? homeTeam.name : awayTeam.name} 득점 추가
                {isOwnGoal && <span className="text-orange-600"> (자책골)</span>}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    시간 (분)
                  </label>
                  <input
                    type="number"
                    value={eventMinute}
                    onChange={(e) => setEventMinute(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ownGoal"
                    checked={isOwnGoal}
                    onChange={(e) => {
                      setIsOwnGoal(e.target.checked)
                      setSelectedPlayer('') // 선수 선택 초기화
                      setAssistPlayer('') // 자책골 체크 시 어시스트 초기화
                    }}
                    className="mr-2 h-4 w-4 text-kopri-blue rounded focus:ring-kopri-blue"
                  />
                  <label htmlFor="ownGoal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    자책골
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isOwnGoal ? '자책골 선수' : '득점자'}
                  </label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">선택하세요</option>
                    {(isOwnGoal 
                      ? (selectedTeam === 'home' ? awayTeam.players : homeTeam.players) // 자책골이면 상대팀 선수 표시
                      : (selectedTeam === 'home' ? homeTeam.players : awayTeam.players)
                    ).map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {!isOwnGoal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      어시스트 (선택사항)
                    </label>
                    <select
                      value={assistPlayer}
                      onChange={(e) => setAssistPlayer(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">없음</option>
                      {(selectedTeam === 'home' ? homeTeam.players : awayTeam.players)
                        .filter(player => player.id !== selectedPlayer)
                        .map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={addGoal}
                  disabled={!selectedPlayer}
                  className="px-4 py-2 bg-kopri-blue text-white rounded-lg hover:bg-kopri-blue/90 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminOnly>
  )
}