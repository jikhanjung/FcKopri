import { supabase } from './supabase'

export interface TeamStanding {
  team_id: string
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export async function calculateStandings(): Promise<TeamStanding[]> {
  try {
    // 모든 팀과 완료된 리그 경기 가져오기 (플레이오프 제외)
    const [teamsResult, matchesResult] = await Promise.all([
      supabase.from('teams').select('id, name'),
      supabase
        .from('matches')
        .select('home_team_id, away_team_id, home_score, away_score')
        .eq('status', 'completed')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null)
        .not('home_team_id', 'is', null)
        .not('away_team_id', 'is', null)
    ])

    if (teamsResult.error) throw teamsResult.error
    if (matchesResult.error) throw matchesResult.error

    const teams = teamsResult.data || []
    const matches = matchesResult.data || []

    // 각 팀의 통계 계산
    const teamStats = teams.map(team => {
      const stats: TeamStanding = {
        team_id: team.id,
        team_name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0
      }

      // 홈경기 통계
      const homeMatches = matches.filter(match => match.home_team_id === team.id)
      homeMatches.forEach(match => {
        stats.played++
        stats.goals_for += match.home_score!
        stats.goals_against += match.away_score!

        if (match.home_score! > match.away_score!) {
          stats.won++
          stats.points += 3
        } else if (match.home_score! === match.away_score!) {
          stats.drawn++
          stats.points += 1
        } else {
          stats.lost++
        }
      })

      // 원정경기 통계
      const awayMatches = matches.filter(match => match.away_team_id === team.id)
      awayMatches.forEach(match => {
        stats.played++
        stats.goals_for += match.away_score!
        stats.goals_against += match.home_score!

        if (match.away_score! > match.home_score!) {
          stats.won++
          stats.points += 3
        } else if (match.away_score! === match.home_score!) {
          stats.drawn++
          stats.points += 1
        } else {
          stats.lost++
        }
      })

      stats.goal_difference = stats.goals_for - stats.goals_against
      return stats
    })

    // 순위 정렬 (승점 > 골득실 > 다득점 순)
    teamStats.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference
      return b.goals_for - a.goals_for
    })

    return teamStats
  } catch (error) {
    console.error('Error calculating standings:', error)
    return []
  }
}

export async function isLeagueCompleted(): Promise<boolean> {
  try {
    // 리그전 경기 수를 확인 (팀이 4개면 총 6경기)
    const { data: teams } = await supabase.from('teams').select('id')
    const teamCount = teams?.length || 0
    const expectedLeagueMatches = (teamCount * (teamCount - 1)) / 2

    // 완료된 리그 경기 수 확인
    const { data: completedMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('status', 'completed')
      .not('home_team_id', 'is', null)
      .not('away_team_id', 'is', null)

    const completedLeagueMatches = completedMatches?.length || 0

    return completedLeagueMatches >= expectedLeagueMatches
  } catch (error) {
    console.error('Error checking league completion:', error)
    return false
  }
}

export async function updatePlayoffMatches(): Promise<boolean> {
  try {
    // 리그가 완료되었는지 확인
    const leagueCompleted = await isLeagueCompleted()
    if (!leagueCompleted) {
      throw new Error('리그전이 아직 완료되지 않았습니다.')
    }

    // 현재 순위 계산
    const standings = await calculateStandings()
    if (standings.length < 4) {
      throw new Error('플레이오프를 위해서는 최소 4개 팀이 필요합니다.')
    }

    // 순위별 팀 할당
    const firstPlace = standings[0]
    const secondPlace = standings[1]
    const thirdPlace = standings[2]
    const fourthPlace = standings[3]

    // 플레이오프 경기 업데이트
    const updates = [
      // 3/4위전: 3위 vs 4위
      {
        match_index: 7, // 7번째 경기
        home_team_id: thirdPlace.team_id,
        away_team_id: fourthPlace.team_id
      },
      // 준결승: 2위 vs 3/4위전 승자 (일단 3위로 설정, 3/4위전 결과에 따라 변경)
      {
        match_index: 8, // 8번째 경기  
        home_team_id: secondPlace.team_id,
        away_team_id: null // 3/4위전 결과를 기다림
      },
      // 결승: 1위 vs 준결승 승자 (일단 2위로 설정, 준결승 결과에 따라 변경)
      {
        match_index: 9, // 9번째 경기
        home_team_id: firstPlace.team_id,
        away_team_id: null // 준결승 결과를 기다림
      }
    ]

    // 경기 업데이트 실행
    for (const update of updates) {
      // 경기 ID 찾기 (생성 순서로 정렬했을 때 해당 인덱스)
      const { data: matches } = await supabase
        .from('matches')
        .select('id')
        .order('created_at', { ascending: true })

      if (matches && matches[update.match_index - 1]) {
        const matchId = matches[update.match_index - 1].id

        const updateData: any = {}
        if (update.home_team_id) updateData.home_team_id = update.home_team_id
        if (update.away_team_id) updateData.away_team_id = update.away_team_id

        await supabase
          .from('matches')
          .update(updateData)
          .eq('id', matchId)
      }
    }

    return true
  } catch (error) {
    console.error('Error updating playoff matches:', error)
    throw error
  }
}

export async function updatePlayoffFromMatchResult(completedMatchId: string): Promise<void> {
  try {
    // 완료된 경기 정보 가져오기
    const { data: completedMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('id', completedMatchId)
      .single()

    if (!completedMatch || completedMatch.status !== 'completed') {
      return
    }

    // 승자 결정
    let winnerId: string | null = null
    if (completedMatch.home_score! > completedMatch.away_score!) {
      winnerId = completedMatch.home_team_id
    } else if (completedMatch.away_score! > completedMatch.home_score!) {
      winnerId = completedMatch.away_team_id
    }

    if (!winnerId) return // 무승부인 경우 처리하지 않음

    // 경기 순서 확인
    const { data: allMatches } = await supabase
      .from('matches')
      .select('id')
      .order('created_at', { ascending: true })

    if (!allMatches) return

    const matchIndex = allMatches.findIndex(match => match.id === completedMatchId) + 1

    // 3/4위전 결과라면 준결승 상대 업데이트
    if (matchIndex === 7) {
      const semifinalMatchId = allMatches[7]?.id // 8번째 경기
      if (semifinalMatchId) {
        await supabase
          .from('matches')
          .update({ away_team_id: winnerId })
          .eq('id', semifinalMatchId)
      }
    }
    // 준결승 결과라면 결승 상대 업데이트
    else if (matchIndex === 8) {
      const finalMatchId = allMatches[8]?.id // 9번째 경기
      if (finalMatchId) {
        await supabase
          .from('matches')
          .update({ away_team_id: winnerId })
          .eq('id', finalMatchId)
      }
    }
  } catch (error) {
    console.error('Error updating playoff from match result:', error)
  }
}