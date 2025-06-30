import { supabase } from './supabase'

/**
 * 무소속 팀 관련 유틸리티 함수들
 */

// 무소속 팀을 가져오거나 생성하는 함수
export async function getOrCreateUnassignedTeam() {
  try {
    // 먼저 무소속 팀이 있는지 확인
    const { data: existingTeam, error: findError } = await supabase
      .from('teams')
      .select('id')
      .eq('name', '무소속')
      .eq('is_hidden', true)
      .single()

    if (existingTeam && !findError) {
      return existingTeam.id
    }

    // 무소속 팀이 없으면 생성
    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (compError) throw compError

    const { data: newTeam, error: createError } = await supabase
      .from('teams')
      .insert({
        name: '무소속',
        competition_id: competitions.id,
        department: '무소속',
        is_hidden: true
      })
      .select('id')
      .single()

    if (createError) throw createError

    console.log('무소속 팀이 생성되었습니다:', newTeam.id)
    return newTeam.id
  } catch (error) {
    console.error('무소속 팀 가져오기/생성 실패:', error)
    throw error
  }
}

// 선수를 무소속 팀으로 이동하는 함수
export async function movePlayerToUnassignedTeam(playerId: string) {
  try {
    const unassignedTeamId = await getOrCreateUnassignedTeam()

    const { error } = await supabase
      .from('players')
      .update({ 
        team_id: unassignedTeamId,
        updated_at: new Date().toISOString()
      })
      .eq('id', playerId)

    if (error) throw error

    console.log(`선수 ${playerId}가 무소속 팀으로 이동되었습니다.`)
    return true
  } catch (error) {
    console.error('선수 무소속 팀 이동 실패:', error)
    throw error
  }
}

// 팀의 모든 선수를 무소속 팀으로 이동하는 함수
export async function moveTeamPlayersToUnassignedTeam(teamId: string) {
  try {
    const unassignedTeamId = await getOrCreateUnassignedTeam()

    // 해당 팀의 모든 선수를 무소속 팀으로 이동
    const { error } = await supabase
      .from('players')
      .update({ 
        team_id: unassignedTeamId,
        updated_at: new Date().toISOString()
      })
      .eq('team_id', teamId)

    if (error) throw error

    console.log(`팀 ${teamId}의 모든 선수가 무소속 팀으로 이동되었습니다.`)
    return true
  } catch (error) {
    console.error('팀 선수들 무소속 팀 이동 실패:', error)
    throw error
  }
}