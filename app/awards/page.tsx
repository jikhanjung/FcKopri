'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Player } from '@/types'
import { 
  TrophyIcon, 
  StarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { 
  TrophyIcon as TrophySolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid'

interface MVPVote {
  id: string
  voted_player_id: string
  reason?: string
  created_at: string
}

interface Best6Vote {
  id: string
  voted_player_id: string
  position_type: 'forward' | 'midfielder' | 'defender' | 'goalkeeper'
  position_slot: number
  created_at: string
}

interface PlayerWithTeam extends Player {
  team_name: string
}

interface VoteStats {
  player_id: string
  player_name: string
  team_name: string
  vote_count: number
}

// 베스트6 포지션 정의
const BEST6_POSITIONS = [
  { type: 'forward', slot: 1, name: '공격수', icon: '⚽' },
  { type: 'midfielder', slot: 1, name: '미드필더 1', icon: '🏃‍♂️' },
  { type: 'midfielder', slot: 2, name: '미드필더 2', icon: '🏃‍♂️' },
  { type: 'defender', slot: 1, name: '수비수 1', icon: '🛡️' },
  { type: 'defender', slot: 2, name: '수비수 2', icon: '🛡️' },
  { type: 'goalkeeper', slot: 1, name: '골키퍼', icon: '🥅' }
] as const

export default function AwardsPage() {
  const searchParams = useSearchParams()
  const [players, setPlayers] = useState<PlayerWithTeam[]>([])
  const [mvpStats, setMvpStats] = useState<VoteStats[]>([])
  const [best6Stats, setBest6Stats] = useState<{ [key: string]: VoteStats[] }>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'mvp' | 'best6' | 'vote-mvp' | 'vote-best6'>('mvp')
  
  // 투표 상태
  const [selectedMVP, setSelectedMVP] = useState('')
  const [mvpReason, setMvpReason] = useState('')
  const [selectedBest6, setSelectedBest6] = useState<{ [key: string]: string }>({})
  const [votingLoading, setVotingLoading] = useState(false)
  const [hasVotedMVP, setHasVotedMVP] = useState(false)
  const [hasVotedBest6, setHasVotedBest6] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // URL 파라미터로 탭 설정
    const tab = searchParams.get('tab')
    if (tab && ['mvp', 'best6', 'vote-mvp', 'vote-best6'].includes(tab)) {
      setActiveTab(tab as 'mvp' | 'best6' | 'vote-mvp' | 'vote-best6')
    }
    
    loadData()
    checkVotingStatus()
  }, [searchParams])

  const loadData = async () => {
    try {
      // 선수 데이터 로드
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          id,
          name,
          position,
          jersey_number,
          department,
          teams!inner(name)
        `)

      if (playersError) throw playersError

      const playersWithTeam = playersData?.map(player => ({
        ...player,
        team_name: Array.isArray(player.teams) ? player.teams[0]?.name : player.teams?.name
      })) || []

      setPlayers(playersWithTeam)

      // MVP 투표 통계 로드
      await loadMVPStats()
      
      // 베스트6 투표 통계 로드
      await loadBest6Stats()

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMVPStats = async () => {
    try {
      const { data, error } = await supabase
        .from('mvp_votes')
        .select(`
          voted_player_id,
          players!inner(name, teams!inner(name))
        `)

      if (error) throw error

      const statsMap: { [key: string]: VoteStats } = {}
      
      data?.forEach(vote => {
        const playerId = vote.voted_player_id
        const playerData = Array.isArray(vote.players) ? vote.players[0] : vote.players
        const teamData = Array.isArray(playerData?.teams) ? playerData?.teams[0] : playerData?.teams
        
        if (!statsMap[playerId]) {
          statsMap[playerId] = {
            player_id: playerId,
            player_name: playerData?.name || '알 수 없음',
            team_name: teamData?.name || '알 수 없음',
            vote_count: 0
          }
        }
        statsMap[playerId].vote_count++
      })

      const statsList = Object.values(statsMap).sort((a, b) => b.vote_count - a.vote_count)
      setMvpStats(statsList)

    } catch (error) {
      console.error('Error loading MVP stats:', error)
    }
  }

  const loadBest6Stats = async () => {
    try {
      const { data, error } = await supabase
        .from('best6_votes')
        .select(`
          voted_player_id,
          position_type,
          position_slot,
          players!inner(name, teams!inner(name))
        `)

      if (error) throw error

      const statsByPosition: { [key: string]: { [playerId: string]: VoteStats } } = {}
      
      // 모든 포지션 슬롯 초기화
      BEST6_POSITIONS.forEach(pos => {
        const key = `${pos.type}-${pos.slot}`
        statsByPosition[key] = {}
      })

      data?.forEach(vote => {
        const playerId = vote.voted_player_id
        const positionKey = `${vote.position_type}-${vote.position_slot}`
        const playerData = Array.isArray(vote.players) ? vote.players[0] : vote.players
        const teamData = Array.isArray(playerData?.teams) ? playerData?.teams[0] : playerData?.teams
        
        if (!statsByPosition[positionKey][playerId]) {
          statsByPosition[positionKey][playerId] = {
            player_id: playerId,
            player_name: playerData?.name || '알 수 없음',
            team_name: teamData?.name || '알 수 없음',
            vote_count: 0
          }
        }
        statsByPosition[positionKey][playerId].vote_count++
      })

      const finalStats: { [key: string]: VoteStats[] } = {}
      BEST6_POSITIONS.forEach(pos => {
        const key = `${pos.type}-${pos.slot}`
        finalStats[key] = Object.values(statsByPosition[key]).sort((a, b) => b.vote_count - a.vote_count)
      })

      setBest6Stats(finalStats)

    } catch (error) {
      console.error('Error loading Best6 stats:', error)
    }
  }

  const checkVotingStatus = async () => {
    try {
      const response = await fetch('/api/get-client-ip')
      const { ip } = await response.json()

      // MVP 투표 여부 확인
      const { data: mvpData } = await supabase
        .from('mvp_votes')
        .select('id')
        .eq('voter_ip', ip)
        .single()

      setHasVotedMVP(!!mvpData)

      // 베스트6 투표 여부 확인
      const { data: best6Data } = await supabase
        .from('best6_votes')
        .select('position_type, position_slot')
        .eq('voter_ip', ip)

      const votedPositions: { [key: string]: boolean } = {}
      best6Data?.forEach(vote => {
        const key = `${vote.position_type}-${vote.position_slot}`
        votedPositions[key] = true
      })
      setHasVotedBest6(votedPositions)

    } catch (error) {
      console.error('Error checking voting status:', error)
    }
  }

  const submitMVPVote = async () => {
    if (!selectedMVP) return

    setVotingLoading(true)
    try {
      const response = await fetch('/api/get-client-ip')
      const { ip } = await response.json()

      const { error } = await supabase
        .from('mvp_votes')
        .insert({
          voter_ip: ip,
          voted_player_id: selectedMVP,
          reason: mvpReason || null
        })

      if (error) throw error

      alert('MVP 투표가 완료되었습니다!')
      setHasVotedMVP(true)
      setSelectedMVP('')
      setMvpReason('')
      await loadMVPStats()

    } catch (error) {
      console.error('Error submitting MVP vote:', error)
      alert('이미 투표하셨거나 오류가 발생했습니다.')
    } finally {
      setVotingLoading(false)
    }
  }

  const submitBest6Vote = async (positionType: string, positionSlot: number, positionName: string) => {
    const key = `${positionType}-${positionSlot}`
    if (!selectedBest6[key]) return

    setVotingLoading(true)
    try {
      const response = await fetch('/api/get-client-ip')
      const { ip } = await response.json()

      const { error } = await supabase
        .from('best6_votes')
        .insert({
          voter_ip: ip,
          voted_player_id: selectedBest6[key],
          position_type: positionType,
          position_slot: positionSlot
        })

      if (error) throw error

      alert(`${positionName} 투표가 완료되었습니다!`)
      setHasVotedBest6(prev => ({ ...prev, [key]: true }))
      setSelectedBest6(prev => ({ ...prev, [key]: '' }))
      await loadBest6Stats()

    } catch (error) {
      console.error('Error submitting Best6 vote:', error)
      alert('이미 투표하셨거나 오류가 발생했습니다.')
    } finally {
      setVotingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kopri-blue mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 시상식</h1>
          <p className="text-lg text-gray-600">KOPRI CUP 풋살 대회 MVP & 베스트6 선정</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('mvp')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'mvp'
                    ? 'border-kopri-blue text-kopri-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrophyIcon className="w-5 h-5 inline mr-2" />
                MVP 결과
              </button>
              <button
                onClick={() => setActiveTab('best6')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'best6'
                    ? 'border-kopri-blue text-kopri-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserGroupIcon className="w-5 h-5 inline mr-2" />
                베스트6 결과
              </button>
              <button
                onClick={() => setActiveTab('vote-mvp')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'vote-mvp'
                    ? 'border-kopri-blue text-kopri-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <StarIcon className="w-5 h-5 inline mr-2" />
                MVP 투표
              </button>
              <button
                onClick={() => setActiveTab('vote-best6')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'vote-best6'
                    ? 'border-kopri-blue text-kopri-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ChartBarIcon className="w-5 h-5 inline mr-2" />
                베스트6 투표
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* MVP 결과 */}
            {activeTab === 'mvp' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">MVP 투표 결과</h2>
                {mvpStats.length === 0 ? (
                  <div className="text-center py-12">
                    <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">아직 투표가 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mvpStats.map((stat, index) => (
                      <div key={stat.player_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{stat.player_name}</p>
                            <p className="text-sm text-gray-600">{stat.team_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-kopri-blue">{stat.vote_count}표</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 베스트6 결과 */}
            {activeTab === 'best6' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">베스트6 투표 결과</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {BEST6_POSITIONS.map(position => {
                    const key = `${position.type}-${position.slot}`
                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">{position.icon}</span>
                          {position.name}
                        </h3>
                        {best6Stats[key]?.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">투표 없음</p>
                        ) : (
                          <div className="space-y-2">
                            {best6Stats[key]?.slice(0, 3).map((stat, index) => (
                              <div key={stat.player_id} className="flex items-center justify-between">
                                <div>
                                  <p className={`font-semibold ${index === 0 ? 'text-kopri-blue' : 'text-gray-700'}`}>
                                    {stat.player_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{stat.team_name}</p>
                                </div>
                                <span className={`text-sm font-bold ${index === 0 ? 'text-kopri-blue' : 'text-gray-600'}`}>
                                  {stat.vote_count}표
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* MVP 투표 */}
            {activeTab === 'vote-mvp' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">MVP 투표하기</h2>
                {hasVotedMVP ? (
                  <div className="text-center py-12">
                    <TrophySolidIcon className="w-16 h-16 text-kopri-blue mx-auto mb-4" />
                    <p className="text-lg text-gray-700">이미 MVP 투표를 완료하셨습니다!</p>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        MVP를 선택해주세요
                      </label>
                      <select
                        value={selectedMVP}
                        onChange={(e) => setSelectedMVP(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                      >
                        <option value="">선수를 선택하세요</option>
                        {players.map(player => (
                          <option key={player.id} value={player.id}>
                            {player.name} ({player.team_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        투표 이유 (선택사항)
                      </label>
                      <textarea
                        value={mvpReason}
                        onChange={(e) => setMvpReason(e.target.value)}
                        placeholder="해당 선수를 MVP로 선택한 이유를 간단히 적어주세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue"
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={submitMVPVote}
                      disabled={!selectedMVP || votingLoading}
                      className="w-full bg-kopri-blue text-white py-3 px-4 rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {votingLoading ? '투표 중...' : 'MVP 투표하기'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 베스트6 투표 */}
            {activeTab === 'vote-best6' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">베스트6 투표하기</h2>
                <p className="text-gray-600 mb-6 text-center">
                  각 포지션별로 최고의 선수를 선택해주세요<br />
                  <span className="text-sm">공격수 1명, 미드필더 2명, 수비수 2명, 골키퍼 1명 (포지션별 개별 투표 가능)</span>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {BEST6_POSITIONS.map(position => {
                    const key = `${position.type}-${position.slot}`
                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">{position.icon}</span>
                          {position.name}
                        </h3>
                        
                        {hasVotedBest6[key] ? (
                          <div className="text-center py-8">
                            <StarSolidIcon className="w-12 h-12 text-kopri-blue mx-auto mb-2" />
                            <p className="text-sm text-gray-600">투표 완료</p>
                          </div>
                        ) : (
                          <div>
                            <select
                              value={selectedBest6[key] || ''}
                              onChange={(e) => setSelectedBest6(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kopri-blue mb-4"
                            >
                              <option value="">선수를 선택하세요</option>
                              {players.map(player => (
                                <option key={player.id} value={player.id}>
                                  {player.name} ({player.team_name})
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => submitBest6Vote(position.type, position.slot, position.name)}
                              disabled={!selectedBest6[key] || votingLoading}
                              className="w-full bg-kopri-blue text-white py-2 px-4 rounded-md hover:bg-kopri-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {votingLoading ? '투표 중...' : '투표하기'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}