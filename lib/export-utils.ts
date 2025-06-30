import { supabase } from './supabase'

export interface ExportData {
  teams: any[]
  players: any[]
  matches: any[]
  standings: any[]
  matchEvents: any[]
}

export async function exportAllData(): Promise<ExportData> {
  try {
    const [teamsResult, playersResult, matchesResult, matchEventsResult] = await Promise.all([
      // 팀 데이터
      supabase.from('teams').select('*').neq('is_hidden', true).order('name'),
      
      // 선수 데이터
      supabase.from('players').select('*, team:teams(name)').order('name'),
      
      // 경기 데이터
      supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .order('match_date'),
      
      // 경기 이벤트 데이터
      supabase
        .from('match_events')
        .select(`
          *,
          player:players(name),
          assist_player:players!match_events_assist_player_id_fkey(name),
          team:teams(name)
        `)
        .order('created_at')
    ])

    if (teamsResult.error) throw teamsResult.error
    if (playersResult.error) throw playersResult.error
    if (matchesResult.error) throw matchesResult.error
    if (matchEventsResult.error) throw matchEventsResult.error

    // 순위표 계산
    const teams = teamsResult.data || []
    const matches = matchesResult.data || []
    const completedMatches = matches.filter(m => m.status === 'completed' && m.home_score !== null && m.away_score !== null)

    const standings = teams.map(team => {
      const stats = {
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
      const homeMatches = completedMatches.filter(match => match.home_team_id === team.id)
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
      const awayMatches = completedMatches.filter(match => match.away_team_id === team.id)
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

    // 순위 정렬
    standings.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference
      return b.goals_for - a.goals_for
    })

    return {
      teams: teamsResult.data || [],
      players: playersResult.data || [],
      matches: matchesResult.data || [],
      standings,
      matchEvents: matchEventsResult.data || []
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    throw error
  }
}

export function downloadJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // CSV 형식에 맞게 특수문자 처리
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // UTF-8 BOM 추가 (한글 깨짐 방지)
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadExcel(data: any[], filename: string) {
  // 간단한 Excel 형식 (실제로는 CSV를 .xlsx 확장자로)
  downloadCSV(data, filename)
}