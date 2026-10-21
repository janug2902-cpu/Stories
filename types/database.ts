export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin'
export type StoryLanguage = 'english' | 'hindi' | 'hinglish'
export type StoryCategory =
  | 'romance'
  | 'erotica'
  | 'fantasy'
  | 'taboo'
  | 'teacher_student'
  | 'maid'
  | 'travel'
  | 'outdoor'
  | 'office'
  | 'bhabhi'
  | 'aunty'
  | 'padosan'
  | 'other'
  | (string & {})
export type ContentRating = 'spicy' | 'explicit'
export type StoryStatus = 'pending' | 'approved' | 'rejected'
export type ReportStatus = 'open' | 'resolved'

export type Profile = {
  id: string
  username: string
  role: UserRole
  daily_ai_quota: number
  last_quota_reset: string
  created_at: string
}

export type ProfileInsert = {
  id: string
  username: string
  role?: UserRole
  daily_ai_quota?: number
  last_quota_reset?: string
  created_at?: string
}

export type ProfileUpdate = {
  id?: string
  username?: string
  role?: UserRole
  daily_ai_quota?: number
  last_quota_reset?: string
  created_at?: string
}

export type Story = {
  id: string
  author_id: string
  title: string
  content: string
  summary: string | null
  language: StoryLanguage
  category: StoryCategory
  content_rating: ContentRating
  is_ai_generated: boolean
  status: StoryStatus
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
  // Multi-part story series navigation
  series_title?: string
  part_number?: number
  total_parts?: number
  next_part_id?: string
  next_part_title?: string
  prev_part_id?: string
  prev_part_title?: string
  // Audio transcript in Hindi for voice narration
  audio_transcript_hi?: string | null
}

export type StoryInsert = {
  id?: string
  author_id: string
  title: string
  content: string
  summary?: string | null
  language: StoryLanguage
  category: StoryCategory
  content_rating: ContentRating
  is_ai_generated?: boolean
  status?: StoryStatus
  views_count?: number
  likes_count?: number
  created_at?: string
  updated_at?: string
  audio_transcript_hi?: string | null
}

export type StoryUpdate = {
  id?: string
  author_id?: string
  title?: string
  content?: string
  summary?: string | null
  language?: StoryLanguage
  category?: StoryCategory
  content_rating?: ContentRating
  is_ai_generated?: boolean
  status?: StoryStatus
  views_count?: number
  likes_count?: number
  created_at?: string
  updated_at?: string
  audio_transcript_hi?: string | null
}

export type Report = {
  id: string
  story_id: string
  reporter_id: string
  reason: string
  status: ReportStatus
  created_at: string
}

export type ReportInsert = {
  id?: string
  story_id: string
  reporter_id: string
  reason: string
  status?: ReportStatus
  created_at?: string
}

export type ReportUpdate = {
  id?: string
  story_id?: string
  reporter_id?: string
  reason?: string
  status?: ReportStatus
  created_at?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      stories: {
        Row: Story
        Insert: StoryInsert
        Update: StoryUpdate
        Relationships: [
          {
            foreignKeyName: 'stories_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reports: {
        Row: Report
        Insert: ReportInsert
        Update: ReportUpdate
        Relationships: [
          {
            foreignKeyName: 'reports_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      story_language: StoryLanguage
      story_category: StoryCategory
      content_rating: ContentRating
      story_status: StoryStatus
      report_status: ReportStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
