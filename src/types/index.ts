export type UserRole = "resident" | "business" | "admin"
export type ChatRoomType = "neighborhood" | "group" | "direct"
export type AlertType = "emergency" | "general"
export type JobType = "full-time" | "part-time" | "casual" | "contract" | "internship"

export interface Profile {
  id: string
  name: string
  phone: string
  zone: string | null
  avatarUrl: string | null
  role: UserRole
  reputationScore: number
  reputationPoints: number
  badges: string[]
  isVerified: boolean
  createdAt: string
  lastSeen: string | null
  lastActiveAt: string | null
}

export interface ChatRoom {
  id: string
  name: string
  type: ChatRoomType
  zone: string | null
  description: string | null
  avatarUrl: string | null
  createdBy: string
  createdAt: string
}

export interface Message {
  id: string
  roomId: string
  userId: string
  text: string | null
  mediaUrls: string[]
  createdAt: string
  sender?: Profile
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  emoji: string
  userId: string
}

export interface Job {
  id: string
  title: string
  description: string
  employerName: string
  location: string
  salaryRange: string | null
  jobType: JobType
  contactPhone: string
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface Business {
  id: string
  name: string
  category: string
  description: string | null
  locationLat: number | null
  locationLng: number | null
  phone: string
  openingHours: any | null
  isFeatured: boolean
  photos: string[]
  ownerId: string | null
  createdBy: string
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string
  category: string
  coverPhoto: string | null
  maxAttendees: number | null
  isFree: boolean
  ticketPrice: number | null
  createdBy: string
  createdAt: string
}

export interface Conversation {
  id: string
  createdAt: string
}

export interface ConversationParticipant {
  id: string
  conversationId: string
  userId: string
  lastReadAt: string | null
  isMuted: boolean
  isArchived: boolean
}

export interface PrivateMessage {
  id: string
  conversationId: string
  senderId: string
  text: string | null
  type: string
  mediaUrl: string | null
  replyToId: string | null
  isStarred: boolean
  isDeleted: boolean
  isEdited: boolean
  createdAt: string
  readAt: string | null
  sender?: Profile
  reactions?: MessageReaction[]
  replyTo?: { id: string; text: string | null; sender?: { name: string } }
}

export interface Alert {
  id: string
  type: AlertType
  title: string
  body: string
  createdBy: string
  createdAt: string
}

export interface Bundle {
  id: string
  provider: string
  name: string
  price: number
  dataAmount: string
  validity: string
  category: string
  url: string | null
  description: string | null
  upvotes: number
  downvotes: number
  createdBy: string
  createdAt: string
}

export interface MarketplaceItem {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  photos: string[]
  location: string | null
  status: string
  sellerId: string
  createdAt: string
}

export interface LostFoundItem {
  id: string
  title: string
  description: string | null
  category: string
  location: string | null
  photo: string | null
  type: string
  status: string
  userId: string
  createdAt: string
}
