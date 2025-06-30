'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TrophyIcon,
  StarIcon,
  UserIcon,
  ChartBarIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface Team {
  id: string
  name: string
  department: string
}

interface ChampionVote {
  id: string
  user_name: string
  user_email: string | null
  voted_team_id: string
  confidence_level: number
  reason: string | null
  created_at: string
  team: Team
}

interface VoteStats {
  team_id: string
  team_name: string
  vote_count: number
  percentage: number
  average_confidence: number
}

export default function ChampionVoting() {
  const [teams, setTeams] = useState<Team[]>([])
  const [votes, setVotes] = useState<ChampionVote[]>([])
  const [voteStats, setVoteStats] = useState<VoteStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // 폼 상태
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    voted_team_id: '',
    confidence_level: 3,
    reason: ''
  })

  useEffect(() => {
    loadData()
    
    // 실시간 업데이트 구독
    const channel = supabase
      .channel('champion_votes_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'champion_votes'
      }, (payload) => {
        console.log('Champion vote change:', payload)
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadData = async () => {
    try {
      // 팀 목록 가져오기
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .neq('is_hidden', true)
        .order('name')

      if (teamsError) throw teamsError

      // 예측 데이터 가져오기
      const { data: votesData, error: votesError } = await supabase
        .from('champion_votes')
        .select(`
          *,
          team:teams(id, name, department)
        `)
        .order('created_at', { ascending: false })

      if (votesError) {
        console.warn('Champion votes not available:', votesError)
        setVotes([])
        setVoteStats([])
      } else {
        setVotes(votesData || [])
        calculateStats(votesData || [], teamsData || [])
      }

      setTeams(teamsData || [])
    } catch (error) {
      console.error('Error loading champion voting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (votesData: any[], teamsData: Team[]) => {
    const teamVotes: { [key: string]: { count: number; totalConfidence: number } } = {}
    
    // 각 팀별 예측 수와 평균 확신도 계산
    votesData.forEach(vote => {
      if (!teamVotes[vote.voted_team_id]) {
        teamVotes[vote.voted_team_id] = { count: 0, totalConfidence: 0 }
      }
      teamVotes[vote.voted_team_id].count++
      teamVotes[vote.voted_team_id].totalConfidence += vote.confidence_level
    })

    const totalVotes = votesData.length
    
    const stats: VoteStats[] = teamsData.map(team => ({
      team_id: team.id,
      team_name: team.name,
      vote_count: teamVotes[team.id]?.count || 0,
      percentage: totalVotes > 0 ? ((teamVotes[team.id]?.count || 0) / totalVotes * 100) : 0,
      average_confidence: teamVotes[team.id] 
        ? teamVotes[team.id].totalConfidence / teamVotes[team.id].count 
        : 0
    })).sort((a, b) => b.vote_count - a.vote_count)

    setVoteStats(stats)
  }

  const submitVote = async () => {
    if (!formData.user_name.trim()) {
      alert('이름을 입력해주세요.')
      return
    }

    if (!formData.voted_team_id) {
      alert('우승 후보 팀을 선택해주세요.')
      return
    }

    try {
      const voteData = {
        user_name: formData.user_name.trim(),
        user_email: formData.user_email.trim() || null,
        voted_team_id: formData.voted_team_id,
        confidence_level: formData.confidence_level,
        reason: formData.reason.trim() || null
      }

      const { error } = await supabase
        .from('champion_votes')
        .upsert([voteData], { 
          onConflict: 'user_email'
        })

      if (error) throw error

      setShowForm(false)
      setFormData({
        user_name: '',
        user_email: '',
        voted_team_id: '',
        confidence_level: 3,
        reason: ''
      })
      
      alert('우승팀 예측이 완료되었습니다!')
    } catch (error) {
      console.error('Error submitting vote:', error)
      alert('예측 중 오류가 발생했습니다.')
    }
  }

  const getConfidenceStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < level ? (
          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ))
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
    if (rank === 3) return <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
    return <FireIcon className="w-6 h-6 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 우승팀 예측 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrophyIcon className="w-6 h-6 text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              우승팀 예측 ({votes.length}명 참여)
            </h2>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            {showForm ? '취소' : '예측하기'}
          </button>
        </div>

        {/* 예측 폼 */}
        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">우승팀 예측</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="예측자 이름"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일 (선택)
                </label>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="이메일 주소"
                />
              </div>
            </div>

            {/* 팀 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                우승 후보 팀 *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.voted_team_id === team.id
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="voted_team"
                      value={team.id}
                      checked={formData.voted_team_id === team.id}
                      onChange={(e) => setFormData({ ...formData, voted_team_id: e.target.value })}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{team.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{team.department}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 확신도 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                확신도
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, confidence_level: level })}
                    className="p-1"
                  >
                    {level <= formData.confidence_level ? (
                      <StarSolidIcon className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </button>
                ))}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  {formData.confidence_level}/5
                </span>
              </div>
            </div>

            {/* 이유 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                예측 이유 (선택)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="이 팀이 우승할 것이라고 생각하는 이유를 적어주세요"
              />
            </div>

            <button
              onClick={submitVote}
              className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
            >
              예측하기
            </button>
          </div>
        )}

        {/* 예측 결과 */}
        <div className="space-y-4">
          {voteStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="animate-pulse mb-2">🏆</div>
              <div>첫 번째로 우승팀을 예측해보세요!</div>
            </div>
          ) : (
            voteStats.map((stat, index) => (
              <div
                key={stat.team_id}
                className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
                  index === 0
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(index + 1)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {stat.team_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.vote_count}표 • 평균 확신도 {stat.average_confidence.toFixed(1)}/5
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {stat.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 최근 예측 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 text-kopri-blue mr-2" />
          최근 예측
        </h3>
        
        {votes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            아직 예측이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {votes.slice(0, 10).map((vote) => (
              <div
                key={vote.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {vote.user_name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">→</span>
                  <span className="font-bold text-yellow-600">
                    {vote.team.name}
                  </span>
                  <div className="flex">
                    {getConfidenceStars(vote.confidence_level)}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(vote.created_at).toLocaleDateString('ko-KR')}
                  </div>
                  {vote.reason && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xs truncate">
                      {vote.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}