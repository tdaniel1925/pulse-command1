export type ClientStatus = 'lead' | 'onboarding' | 'active' | 'paused' | 'churned'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled'
export type OnboardingStep =
  | 'signup'
  | 'call_scheduled'
  | 'call_done'
  | 'profile_built'
  | 'assets_recorded'
  | 'avatar_pending'
  | 'avatar_done'
  | 'active'

export type AssetType =
  | 'video_recording'
  | 'audio_recording'
  | 'avatar'
  | 'voice_clone'
  | 'heygen_video'
  | 'elevenlabs_audio'
  | 'audiogram'
  | 'landing_page'
  | 'social_post'
  | 'report'

export type AssetStatus = 'pending' | 'processing' | 'ready' | 'failed'

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export type ActivityType =
  | 'call'
  | 'email'
  | 'sms'
  | 'note'
  | 'status_change'
  | 'content_published'
  | 'report_sent'
  | 'payment'
  | 'error'
  | 'onboarding_step'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'done'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export interface Client {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  business_name: string
  website?: string
  industry?: string
  status: ClientStatus
  subscription_status: SubscriptionStatus
  stripe_customer_id?: string
  stripe_subscription_id?: string
  onboarding_step: OnboardingStep
  onboarding_pin: string
  vapi_call_id?: string
  call_scheduled_at?: string
  call_completed_at?: string
  brand_profile_id?: string
  notes?: string
  tags?: string[]
  assigned_to?: string
}

export interface BrandProfile {
  id: string
  client_id: string
  created_at: string
  updated_at: string
  business_description?: string
  unique_value_prop?: string
  target_audience?: string
  audience_pain_points?: string
  competitors?: string
  differentiators?: string
  tone_of_voice?: string
  brand_personality?: string
  content_pillars?: string[]
  keywords?: string[]
  hashtags?: string[]
  primary_color?: string
  secondary_color?: string
  font_preference?: string
  style_direction?: string
  logo_url?: string
  priority_channels?: string[]
  posting_frequency?: string
  best_times?: string
  past_social_notes?: string
  vapi_transcript?: string
  ai_analysis_raw?: string
}

export interface SocialPost {
  id: string
  client_id: string
  created_at: string
  content: string
  image_url?: string
  video_url?: string
  platforms: string[]
  scheduled_at?: string
  published_at?: string
  status: PostStatus
  ayrshare_post_id?: string
  performance?: Record<string, unknown>
  month_batch?: string
}

export interface Video {
  id: string
  client_id: string
  created_at: string
  title: string
  script?: string
  heygen_video_id?: string
  status: AssetStatus
  url?: string
  thumbnail_url?: string
  scheduled_at?: string
  published_at?: string
}

export interface AudioEpisode {
  id: string
  client_id: string
  created_at: string
  title: string
  script?: string
  elevenlabs_audio_id?: string
  audiogram_url?: string
  status: AssetStatus
  url?: string
  scheduled_at?: string
  published_at?: string
}

export interface LandingPage {
  id: string
  client_id: string
  created_at: string
  title: string
  slug: string
  url?: string
  status: 'draft' | 'deploying' | 'live' | 'archived'
  conversion_rate?: number
  visits?: number
  leads?: number
}

export interface Report {
  id: string
  client_id: string
  created_at: string
  month: number
  year: number
  status: 'generating' | 'ready' | 'sent'
  data?: Record<string, unknown>
  pdf_url?: string
  sent_at?: string
}

export interface Activity {
  id: string
  client_id: string
  created_at: string
  type: ActivityType
  title: string
  description?: string
  metadata?: Record<string, unknown>
  created_by: 'admin' | 'system' | 'client'
}

export interface Task {
  id: string
  client_id: string
  created_at: string
  due_at?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: string
  completed_at?: string
}

export interface PipelineNode {
  id: string
  client_id?: string
  node_id: string
  node_type: string
  position_x: number
  position_y: number
  config?: Record<string, unknown>
  status: NodeStatus
  last_run_at?: string
  last_error?: string
}
