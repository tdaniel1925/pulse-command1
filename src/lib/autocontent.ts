/**
 * AutoContent API Client
 *
 * Replaces: ElevenLabs (podcasts), HeyGen (video shorts), custom presentations (slide decks)
 * Adds: infographics, documents, deep research
 *
 * Docs: https://docs.autocontentapi.com
 * Status codes: 0 = pending, 5 = processing, 100 = completed
 */

const BASE = 'https://api.autocontentapi.com'

function getToken() {
  const token = process.env.AUTOCONTENT_API_KEY
  if (!token) throw new Error('AUTOCONTENT_API_KEY environment variable is not set')
  return token
}

function headers() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type ContentStatus = 0 | 5 | 100 // pending | processing | completed

export interface ContentRequest {
  request_id: string
  status: ContentStatus
}

export interface ContentResult {
  id: string
  status: ContentStatus
  audioTitle?: string
  audioUrl?: string
  videoUrl?: string
  imageUrl?: string
  responseText?: string
  shareUrl?: string
  requestedOn?: string
  succeededOn?: string
  errorMessage?: string
}

export type OutputType = 'audio' | 'video' | 'text' | 'infographic' | 'slide_deck' | 'quiz' | 'document'
export type Duration = 'short' | 'medium' | 'long'
export type SlideDeckFormat = 'detailed' | 'presenter'

export interface Resource {
  type: 'website' | 'youtube' | 'text' | 'file' | 'pdf'
  content: string
}

export interface Avatar {
  id: string
  name: string
  gender: 'M' | 'F'
}

export interface ScriptLine {
  avatarId: number
  text: string
}

export interface PodcastShow {
  id: string
  name: string
  rssUrl?: string
}

// ─── Content Creation ───────────────────────────────────────────────────────

export async function createContent(params: {
  resources?: Resource[]
  topic?: string
  text?: string
  outputType: OutputType
  duration?: Duration
  podcastId?: string
  episodeTitle?: string
  projectId?: string
  callbackData?: string
}): Promise<ContentRequest> {
  const res = await fetch(`${BASE}/content/Create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      resources: params.resources,
      topic: params.topic,
      text: params.text,
      outputType: params.outputType,
      duration: params.duration,
      podcastId: params.podcastId,
      episodeTitle: params.episodeTitle,
      projects: params.projectId ? [params.projectId] : undefined,
      callbackData: params.callbackData,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AutoContent Create failed (${res.status}): ${err}`)
  }
  return res.json()
}

// ─── Status Polling ─────────────────────────────────────────────────────────

export async function getStatus(requestId: string): Promise<ContentResult> {
  const res = await fetch(`${BASE}/content/Status/${requestId}`, {
    headers: headers(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AutoContent Status failed (${res.status}): ${err}`)
  }
  return res.json()
}

export async function pollUntilDone(
  requestId: string,
  opts?: { maxWaitMs?: number; intervalMs?: number }
): Promise<ContentResult> {
  const maxWait = opts?.maxWaitMs ?? 300_000 // 5 min default
  const interval = opts?.intervalMs ?? 10_000 // 10s default
  const start = Date.now()

  while (Date.now() - start < maxWait) {
    const result = await getStatus(requestId)
    if (result.status === 100) return result
    if (result.errorMessage) throw new Error(`AutoContent error: ${result.errorMessage}`)
    await new Promise(r => setTimeout(r, interval))
  }
  throw new Error(`AutoContent timed out after ${maxWait / 1000}s for request ${requestId}`)
}

// ─── Podcast ────────────────────────────────────────────────────────────────

export async function createPodcast(params: {
  text: string
  topic?: string
  resources?: Resource[]
  duration?: Duration
  podcastId?: string
  episodeTitle?: string
  projectId?: string
}): Promise<ContentRequest> {
  return createContent({
    ...params,
    outputType: 'audio',
  })
}

export async function createPodcastShow(params: {
  name: string
  description: string
  author: string
  link: string
  email: string
  imageFile?: Buffer
}): Promise<PodcastShow> {
  const form = new FormData()
  form.append('name', params.name)
  form.append('description', params.description)
  form.append('author', params.author)
  form.append('link', params.link)
  form.append('email', params.email)
  if (params.imageFile) {
    form.append('imageFile', new Blob([params.imageFile], { type: 'image/png' }), 'cover.png')
  }

  const res = await fetch(`${BASE}/podcast/CreateShow`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AutoContent CreateShow failed (${res.status}): ${err}`)
  }
  return res.json()
}

export function getPodcastRssUrl(podcastId: string): string {
  return `${BASE}/podcast/rss/${podcastId}`
}

// ─── Video Shorts ───────────────────────────────────────────────────────────

export async function getAvatars(): Promise<Avatar[]> {
  const res = await fetch(`${BASE}/video/GetAvatars`, {
    headers: headers(),
  })
  if (!res.ok) return []
  return res.json()
}

export async function createVideoShort(params: {
  text: string
  avatar1: string
  avatar2?: string
  subtitles?: boolean
  prompt?: string
  projectId?: string
}): Promise<ContentRequest> {
  const res = await fetch(`${BASE}/video/CreateShortsFromScript`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      script: [{ avatarId: parseInt(params.avatar1), text: params.text }],
      subtitles: params.subtitles ?? true,
      prompt: params.prompt,
      projects: params.projectId ? [params.projectId] : undefined,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AutoContent CreateShorts failed (${res.status}): ${err}`)
  }
  return res.json()
}

export async function createVideoShortFromScript(params: {
  script: ScriptLine[]
  subtitles?: boolean
  prompt?: string
}): Promise<ContentRequest> {
  const res = await fetch(`${BASE}/video/CreateShortsFromScript`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      script: params.script,
      subtitles: params.subtitles ?? true,
      prompt: params.prompt,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AutoContent CreateShortsFromScript failed (${res.status}): ${err}`)
  }
  return res.json()
}

export async function getVideoShorts(): Promise<ContentResult[]> {
  const res = await fetch(`${BASE}/video/GetShorts`, {
    headers: headers(),
  })
  if (!res.ok) return []
  return res.json()
}

export async function getVideoStatus(requestId: string): Promise<ContentResult> {
  const res = await fetch(`${BASE}/video/GetShorts`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to get video shorts')
  const shorts: ContentResult[] = await res.json()
  const found = shorts.find(s => s.id === requestId)
  if (!found) throw new Error(`Video short ${requestId} not found`)
  return found
}

// ─── Slide Decks ────────────────────────────────────────────────────────────

export async function createSlideDeck(params: {
  text: string
  resources?: Resource[]
  format?: SlideDeckFormat
  projectId?: string
}): Promise<ContentRequest> {
  return createContent({
    text: params.text,
    resources: params.resources,
    outputType: 'slide_deck',
    projectId: params.projectId,
  })
}

export async function getSlideDeckDownloadUrl(slideDeckId: string): Promise<string> {
  return `${BASE}/slide-decks/${slideDeckId}/download`
}

export async function getSlideDeckPreviewUrl(slideDeckId: string): Promise<string> {
  return `${BASE}/slide-decks/${slideDeckId}/preview`
}

// ─── Infographics ───────────────────────────────────────────────────────────

export async function createInfographic(params: {
  text: string
  resources?: Resource[]
  projectId?: string
}): Promise<ContentRequest> {
  return createContent({
    text: params.text,
    resources: params.resources,
    outputType: 'infographic',
    projectId: params.projectId,
  })
}

// ─── Documents (Lead Magnets, Reports) ──────────────────────────────────────

export async function createDocument(params: {
  text: string
  resources?: Resource[]
  projectId?: string
}): Promise<ContentRequest> {
  return createContent({
    text: params.text,
    resources: params.resources,
    outputType: 'document',
    projectId: params.projectId,
  })
}

// ─── Deep Research ──────────────────────────────────────────────────────────

export async function createDeepResearch(params: {
  topic: string
  resources?: Resource[]
}): Promise<ContentRequest> {
  const res = await fetch(`${BASE}/content/Create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      topic: params.topic,
      resources: params.resources,
      outputType: 'text',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AutoContent DeepResearch failed (${res.status}): ${err}`)
  }
  return res.json()
}

// ─── Projects (Brand Assets) ────────────────────────────────────────────────

export async function createProject(params: {
  name: string
  brandColor?: string
  logoUrl?: string
}): Promise<{ id: string }> {
  const form = new FormData()
  form.append('name', params.name)
  if (params.brandColor) form.append('brandColor', params.brandColor)
  if (params.logoUrl) {
    // Download logo and attach as file
    try {
      const logoRes = await fetch(params.logoUrl)
      if (logoRes.ok) {
        const buf = await logoRes.arrayBuffer()
        form.append('logoFile', new Blob([buf], { type: 'image/png' }), 'logo.png')
      }
    } catch { /* skip logo */ }
  }

  const res = await fetch(`${BASE}/content/CreateProject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AutoContent CreateProject failed (${res.status}): ${err}`)
  }
  return res.json()
}

// ─── Usage / Credits ────────────────────────────────────────────────────────

export async function getUsage(): Promise<{
  allowed: number
  used: number
  allowedDailyPodcasts: number
  usedDailyPodcasts: number
}> {
  const res = await fetch(`${BASE}/content/Usage`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to get usage')
  return res.json()
}
