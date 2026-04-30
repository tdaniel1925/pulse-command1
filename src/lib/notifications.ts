import { createAdminClient } from '@/lib/supabase/admin'

export type NotificationType =
  | 'post_ready'
  | 'post_published'
  | 'video_ready'
  | 'presentation_ready'
  | 'payment_failed'
  | 'welcome'

export async function createNotification({
  clientId,
  type,
  title,
  body,
  link,
}: {
  clientId: string
  type: NotificationType
  title: string
  body?: string
  link?: string
}) {
  const admin = createAdminClient()
  await admin.from('notifications').insert({ client_id: clientId, type, title, body, link })
}
