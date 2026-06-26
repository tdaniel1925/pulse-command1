/**
 * Zernio social-posting client. Replaces the previous Ayrshare integration.
 *
 * Model: ONE workspace API key (ZERNIO_API_KEY, Bearer). Each client gets a
 * Zernio "profile" (`zernio_profile_id`); the client connects their social
 * accounts under that profile via OAuth, and we publish to the accounts that
 * belong to it. So the mapping is: client → zernio profile → social accounts.
 *
 * Docs: https://docs.zernio.com — OpenAPI base https://zernio.com/api
 */

const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY
const BASE = (process.env.ZERNIO_BASE_URL ?? 'https://zernio.com/api').replace(/\/$/, '')

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ZERNIO_API_KEY ?? ''}`,
  }
}

/** True when a workspace key is present; callers can short-circuit gracefully. */
export function zernioConfigured(): boolean {
  return Boolean(ZERNIO_API_KEY)
}

async function zfetch(path: string, init?: RequestInit): Promise<Response> {
  if (!ZERNIO_API_KEY) throw new Error('ZERNIO_API_KEY is not set')
  return fetch(`${BASE}${path}`, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } })
}

// ─── Profiles: one per client ────────────────────────────────────────────────

/** Create a Zernio profile for a client. Returns the profile id (24-char hex). */
export async function createZernioProfile(params: {
  name: string
  description?: string
}): Promise<{ id: string }> {
  const res = await zfetch('/v1/profiles', {
    method: 'POST',
    body: JSON.stringify({ name: params.name, description: params.description }),
  })
  if (!res.ok) throw new Error(`Zernio createProfile failed: ${await res.text()}`)
  const data = await res.json()
  // ProfileCreateResponse: { message, profile: { _id, ... } }
  const id = data?.profile?._id ?? data?._id
  if (!id) throw new Error('Zernio createProfile: no profile id in response')
  return { id }
}

/** Delete a client's Zernio profile (e.g. on offboarding). Best-effort. */
export async function deleteZernioProfile(profileId: string): Promise<void> {
  try {
    await zfetch(`/v1/profiles/${profileId}`, { method: 'DELETE' })
  } catch {
    // non-critical
  }
}

// ─── Connect: OAuth link per platform ────────────────────────────────────────

export type ZernioPlatform =
  | 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'youtube'
  | 'threads' | 'reddit' | 'pinterest' | 'bluesky' | 'googlebusiness'
  | 'telegram' | 'snapchat' | 'discord' | 'whatsapp'

/**
 * Get the OAuth authorization URL for connecting one platform under a profile.
 * After the user authorizes, Zernio redirects to `redirectUrl` with query params
 * `?connected={platform}&profileId=X&accountId=Y&username=Z`.
 */
export async function getZernioConnectUrl(params: {
  platform: ZernioPlatform
  profileId: string
  redirectUrl: string
}): Promise<string> {
  const qs = new URLSearchParams({
    profileId: params.profileId,
    redirect_url: params.redirectUrl,
  })
  const res = await zfetch(`/v1/connect/${params.platform}?${qs.toString()}`)
  if (!res.ok) throw new Error(`Zernio connect URL failed: ${await res.text()}`)
  const data = await res.json()
  if (!data?.authUrl) throw new Error('Zernio connect: no authUrl in response')
  return data.authUrl as string
}

// ─── Accounts: list what a profile has connected ─────────────────────────────

export interface ZernioAccount {
  id: string
  platform: string
  username?: string
  displayName?: string
  isActive: boolean
}

/** List the connected social accounts under a profile. */
export async function listZernioAccounts(profileId: string): Promise<ZernioAccount[]> {
  try {
    const qs = new URLSearchParams({ profileId, status: 'connected' })
    const res = await zfetch(`/v1/accounts?${qs.toString()}`)
    if (!res.ok) return []
    const data = await res.json()
    const accounts: unknown[] = Array.isArray(data?.accounts) ? data.accounts : []
    return accounts.map((a) => {
      const acc = a as Record<string, unknown>
      return {
        id: String(acc._id),
        platform: String(acc.platform),
        username: acc.username as string | undefined,
        displayName: acc.displayName as string | undefined,
        isActive: Boolean(acc.isActive),
      }
    })
  } catch {
    return []
  }
}

/** Convenience: distinct connected platform ids for a profile (for status UI). */
export async function getZernioConnectedPlatforms(profileId: string): Promise<string[]> {
  const accounts = await listZernioAccounts(profileId)
  return [...new Set(accounts.filter((a) => a.isActive).map((a) => a.platform))]
}

// ─── Posting ─────────────────────────────────────────────────────────────────

export interface ZernioPostTarget {
  platform: string
  accountId: string
  /** Per-platform caption override (e.g. shorter text for Twitter). */
  customContent?: string
}

export interface ZernioPostParams {
  content: string
  targets: ZernioPostTarget[]
  /** Image/video URLs to attach. */
  mediaUrls?: string[]
  /** ISO date-time to schedule; when omitted with publishNow=true, posts now. */
  scheduledFor?: string
  publishNow?: boolean
}

export interface ZernioPostResult {
  id: string | null
  status: string
  raw: unknown
}

/**
 * Create (and by default immediately publish) a post to one or more accounts.
 * Mirrors the old postToAyrshare contract but uses Zernio's `platforms[]` shape.
 */
export async function postToZernio(params: ZernioPostParams): Promise<ZernioPostResult> {
  const publishNow = params.publishNow ?? !params.scheduledFor
  const body: Record<string, unknown> = {
    content: params.content,
    platforms: params.targets.map((t) => ({
      platform: t.platform,
      accountId: t.accountId,
      ...(t.customContent ? { customContent: t.customContent } : {}),
    })),
    publishNow,
  }
  if (params.scheduledFor) body.scheduledFor = params.scheduledFor
  if (params.mediaUrls?.length) {
    body.mediaItems = params.mediaUrls.map((url) => ({ url }))
  }

  const res = await zfetch('/v1/posts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Zernio post failed: ${JSON.stringify(data)}`)
  // PostCreateResponse: { message, post: { _id, status, ... } }
  return {
    id: data?.post?._id ?? null,
    status: data?.post?.status ?? 'unknown',
    raw: data,
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────

/** Profile-level analytics summary. Best-effort — returns zeros on any failure. */
export async function getZernioAnalyticsSummary(profileId: string): Promise<{
  totalPosts: number
  totalEngagement: number
}> {
  try {
    const qs = new URLSearchParams({ profileId })
    const res = await zfetch(`/v1/analytics?${qs.toString()}`)
    if (!res.ok) return { totalPosts: 0, totalEngagement: 0 }
    const data = await res.json()
    return {
      totalPosts: data?.totalPosts ?? 0,
      totalEngagement: data?.totalEngagement ?? 0,
    }
  } catch {
    return { totalPosts: 0, totalEngagement: 0 }
  }
}
