// 공통 타입 정의
export interface Competition {
  id: string
  name: string
  description?: string
  start_date?: string
  end_date?: string
  created_at: string
}

export interface Team {
  id: string
  competition_id?: string
  name: string
  logo_url?: string
  is_hidden?: boolean
  created_at: string
}

export interface Player {
  id: string
  team_id?: string
  name: string
  position?: string
  jersey_number?: number
  department?: string
  created_at: string
}

export interface Match {
  id: string
  competition_id?: string
  home_team_id?: string
  away_team_id?: string
  match_date?: string
  home_score?: number
  away_score?: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  youtube_url?: string
  youtube_title?: string
  youtube_thumbnail_url?: string
  youtube_duration?: string
  created_at: string
}

export interface MatchVideo {
  id: string
  match_id: string
  video_type: 'highlight' | 'goals' | 'full_match' | 'interview' | 'analysis' | 'other'
  title: string
  youtube_url: string
  youtube_video_id?: string
  thumbnail_url?: string
  duration?: string
  description?: string
  display_order: number
  is_featured: boolean
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface Standing {
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

// 사용자-대회 관계 타입
export interface UserCompetitionRelation {
  id: string
  user_id: string
  competition_id: string
  role: 'participant' | 'admin' | 'moderator'
  joined_at: string
  created_at: string
  updated_at: string
}

// 사용자-대회 관계 상세 정보 (뷰)
export interface UserCompetitionDetails {
  id: string
  user_id: string
  competition_id: string
  competition_role: 'participant' | 'admin' | 'moderator'
  joined_at: string
  created_at: string
  updated_at: string
  
  // 사용자 정보
  display_name: string | null
  email: string
  avatar_url: string | null
  department: string | null
  
  // 대회 정보
  competition_name: string
  competition_description: string | null
  start_date: string | null
  end_date: string | null
  
  // 시스템 역할
  user_system_role: 'user' | 'moderator' | 'admin' | 'super_admin' | null
}

// 리그 참여 신청 타입
export interface LeagueJoinRequest {
  id: string
  user_id: string
  competition_id: string
  requested_role: 'participant' | 'admin' | 'moderator'
  status: 'pending' | 'approved' | 'rejected'
  message: string | null
  admin_response: string | null
  processed_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
}

// 리그 참여 신청 상세 정보 (뷰)
export interface LeagueJoinRequestDetails {
  id: string
  user_id: string
  competition_id: string
  requested_role: 'participant' | 'admin' | 'moderator'
  status: 'pending' | 'approved' | 'rejected'
  message: string | null
  admin_response: string | null
  processed_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
  
  // 신청자 정보
  user_display_name: string | null
  user_email: string
  user_avatar_url: string | null
  user_department: string | null
  
  // 대회 정보
  competition_name: string
  competition_description: string | null
  competition_start_date: string | null
  competition_end_date: string | null
  
  // 처리한 관리자 정보
  admin_display_name: string | null
  admin_email: string | null
}