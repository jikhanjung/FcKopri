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