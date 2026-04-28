import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024  // 500 MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const requestId = formData.get('requestId') as string | null

    if (!file || !requestId) {
      return NextResponse.json({ error: 'Missing file or requestId' }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'File type not allowed. Use JPG, PNG, WEBP, MP4, or MOV.' }, { status: 400 })
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      const limit = isImage ? '10MB' : '500MB'
      return NextResponse.json({ error: `File too large. Max size: ${limit}` }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify the request belongs to this client
    const { data: contentRequest } = await admin
      .from('content_requests')
      .select('id')
      .eq('id', requestId)
      .eq('client_id', client.id)
      .single()

    if (!contentRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const storagePath = `requests/${client.id}/${requestId}/${fileName}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error: uploadError } = await admin.storage
      .from('content')
      .upload(storagePath, buffer, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = admin.storage
      .from('content')
      .getPublicUrl(storagePath)

    await admin.from('content_request_files').insert({
      request_id: requestId,
      file_url: publicUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    })

    return NextResponse.json({ success: true, fileUrl: publicUrl })
  } catch (err) {
    console.error('content-requests/upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
