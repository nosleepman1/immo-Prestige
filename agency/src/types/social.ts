import type { Property } from './property'

export interface Post {
  id: number
  user: { id: number; name: string } | null
  property: Property | null
  likes_count: number
  comments_count: number
  is_liked_by_user: boolean
  created_at: string
}

export interface CommentReply {
  id: number
  comment_id: number
  content: string
  user: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  post_id: number
  content: string
  user: { id: number; name: string } | null
  replies_count: number
  replies: CommentReply[]
  created_at: string
  updated_at: string
}
