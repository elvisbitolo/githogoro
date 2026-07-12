export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          phone: string
          zone: string | null
          avatar_url: string | null
          role: "resident" | "business" | "admin"
          reputation_score: number
          badges: string[]
          is_verified: boolean
          created_at: string
          last_seen: string | null
        }
        Insert: {
          id: string
          name: string
          phone: string
          zone?: string | null
          avatar_url?: string | null
          role?: "resident" | "business" | "admin"
          reputation_score?: number
          badges?: string[]
          is_verified?: boolean
          created_at?: string
          last_seen?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          zone?: string | null
          avatar_url?: string | null
          role?: "resident" | "business" | "admin"
          reputation_score?: number
          badges?: string[]
          is_verified?: boolean
          created_at?: string
          last_seen?: string | null
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          type: "neighborhood" | "group" | "direct"
          zone: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: "neighborhood" | "group" | "direct"
          zone?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: "neighborhood" | "group" | "direct"
          zone?: string | null
          created_by?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          text: string | null
          media_urls: string[]
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          text?: string | null
          media_urls?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          text?: string | null
          media_urls?: string[]
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          employer_name: string
          location: string
          salary_range: string | null
          job_type: string
          contact_phone: string
          is_active: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          employer_name: string
          location: string
          salary_range?: string | null
          job_type: string
          contact_phone: string
          is_active?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          employer_name?: string
          location?: string
          salary_range?: string | null
          job_type?: string
          contact_phone?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          location_lat: number | null
          location_lng: number | null
          phone: string
          is_featured: boolean
          photos: string[]
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          phone: string
          is_featured?: boolean
          photos?: string[]
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          phone?: string
          is_featured?: boolean
          photos?: string[]
          created_by?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          location: string
          category: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          location: string
          category: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          location?: string
          category?: string
          created_by?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
        }
        Insert: {
          id?: string
          created_at?: string
        }
        Update: {
          id?: string
          created_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          last_read_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          last_read_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          last_read_at?: string | null
        }
      }
      private_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          text?: string
          created_at?: string
        }
      }
      chat_participants: {
        Row: {
          room_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          room_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          room_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          type: "emergency" | "general"
          title: string
          body: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          type: "emergency" | "general"
          title: string
          body: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: "emergency" | "general"
          title?: string
          body?: string
          created_by?: string
          created_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          action: string
          target_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_owner: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
