export type UserRole = "resident" | "business" | "admin"
export type ChatRoomType = "neighborhood" | "group" | "direct"
export type AlertType = "emergency" | "general"
export type JobType = "full-time" | "part-time" | "casual" | "contract" | "internship"

export interface Profile {
  id: string
  name: string
  phone: string
  zone: string | null
  avatar_url: string | null
  role: UserRole
  reputation_score: number
  badges: string[]
  is_verified: boolean
  created_at: string
  last_seen: string | null
}

export interface ChatRoom {
  id: string
  name: string
  type: ChatRoomType
  zone: string | null
  created_by: string
  created_at: string
}

export interface Message {
  id: string
  room_id: string
  user_id: string
  text: string | null
  media_urls: string[]
  created_at: string
  sender?: Profile
}

export interface Job {
  id: string
  title: string
  description: string
  employer_name: string
  location: string
  salary_range: string | null
  job_type: JobType
  contact_phone: string
  is_active: boolean
  created_by: string
  created_at: string
}

export interface Business {
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

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string
  category: string
  created_by: string
  created_at: string
}

export interface Conversation {
  id: string
  created_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  last_read_at: string | null
}

export interface PrivateMessage {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  created_at: string
  profiles?: Profile
}

export interface Alert {
  id: string
  type: AlertType
  title: string
  body: string
  created_by: string
  created_at: string
}
