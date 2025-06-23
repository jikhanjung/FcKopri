import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 정의
export type Database = {
  public: {
    Tables: {
      competitions: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          competition_id: string | null
          name: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          competition_id?: string | null
          name: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          competition_id?: string | null
          name?: string
          logo_url?: string | null
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          team_id: string | null
          name: string
          position: string | null
          jersey_number: number | null
          department: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id?: string | null
          name: string
          position?: string | null
          jersey_number?: number | null
          department?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          name?: string
          position?: string | null
          jersey_number?: number | null
          department?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          competition_id: string | null
          home_team_id: string | null
          away_team_id: string | null
          match_date: string | null
          home_score: number | null
          away_score: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          competition_id?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          match_date?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          competition_id?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          match_date?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}