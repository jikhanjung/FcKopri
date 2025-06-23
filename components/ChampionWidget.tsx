'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { TrophyIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

interface VoteStats {
  team_id: string
  team_name: string
  vote_count: number
  percentage: number
}

export default function ChampionWidget() {
  const [topTeams, setTopTeams] = useState<VoteStats[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChampionStats()
    
    // 실시간 업데이트 구독
    const channel = supabase
      .channel('champion_widget_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'champion_votes'
      }, () => {
        loadChampionStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadChampionStats = async () => {
    try {
      const { data: votesData, error } = await supabase
        .from('champion_votes')
        .select(`
          voted_team_id,
          team:teams(id, name)
        `)

      if (error) {
        console.warn('Champion votes not available:', error)
        setTopTeams([])
        setTotalVotes(0)
        setLoading(false)
        return
      }

      const teamVotes: { [key: string]: { name: string; count: number } } = {}
      
      votesData?.forEach(vote => {
        const teamId = vote.voted_team_id
        const teamName = vote.team?.name || '알 수 없음'
        
        if (!teamVotes[teamId]) {
          teamVotes[teamId] = { name: teamName, count: 0 }
        }
        teamVotes[teamId].count++
      })

      const totalVotesCount = votesData?.length || 0
      setTotalVotes(totalVotesCount)

      const stats: VoteStats[] = Object.entries(teamVotes)
        .map(([teamId, data]) => ({
          team_id: teamId,
          team_name: data.name,
          vote_count: data.count,
          percentage: totalVotesCount > 0 ? (data.count / totalVotesCount * 100) : 0
        }))
        .sort((a, b) => b.vote_count - a.vote_count)
        .slice(0, 3)

      setTopTeams(stats)
    } catch (error) {
      console.error('Error loading champion stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">우승 후보 투표</h3>
        </div>
        <Link
          href="/champion"
          className="text-sm text-kopri-blue hover:text-kopri-blue/80 flex items-center"
        >
          투표하기
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {totalVotes === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <div className="animate-pulse mb-2">🏆</div>
          <div className="text-sm">아직 투표가 없습니다</div>
          <Link
            href="/champion"
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            첫 번째로 투표해보세요!
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {topTeams.map((team, index) => (
            <div
              key={team.team_id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                index === 0
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-white'
                    : index === 1
                    ? 'bg-gray-400 text-white'
                    : 'bg-orange-400 text-white'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {team.team_name}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${team.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {team.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              총 <span className="font-bold text-yellow-600">{totalVotes}</span>명 참여
            </div>
          </div>
        </div>
      )}
    </div>
  )
}