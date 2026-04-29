const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY!;
const BASE = 'https://api.ayrshare.com/api';

function headers(profileKey?: string) {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AYRSHARE_API_KEY}`,
  };
  if (profileKey) h['Profile-Key'] = profileKey;
  return h;
}

// ─── Create a user profile for a new client ──────────────────────────────────

export async function createAyrshareProfile(params: {
  title: string;         // client business name
  email?: string;
}): Promise<{ profileKey: string; id: string }> {
  const res = await fetch(`${BASE}/profiles`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title: params.title, email: params.email }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ayrshare createProfile failed: ${err}`);
  }
  const data = await res.json();
  return { profileKey: data.profileKey, id: data.id };
}

// ─── Generate JWT link for client to connect their social accounts ────────────

export async function generateAyrshareJWT(profileKey: string): Promise<string> {
  const res = await fetch(`${BASE}/profiles/generateJWT`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ profileKey }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ayrshare generateJWT failed: ${err}`);
  }
  const data = await res.json();
  return data.url as string;
}

// ─── Get connected platforms for a profile ───────────────────────────────────

export async function getAyrshareProfile(profileKey: string): Promise<{
  activeSocialAccounts: string[];
}> {
  const res = await fetch(`${BASE}/profiles`, {
    method: 'GET',
    headers: headers(profileKey),
  });
  if (!res.ok) return { activeSocialAccounts: [] };
  const data = await res.json();
  return { activeSocialAccounts: data.activeSocialAccounts ?? [] };
}

// ─── Post to social platforms ─────────────────────────────────────────────────

export type AyrsharePostParams = {
  profileKey: string;
  post: string;           // caption text
  platforms: string[];    // ['instagram', 'facebook', 'linkedin', 'twitter']
  mediaUrls?: string[];   // image URLs
  scheduleDate?: string;  // ISO date string for scheduled posts
};

export type AyrsharePostResult = {
  id: string;
  status: string;
  errors?: any[];
  postIds?: Record<string, string>;
};

export async function postToAyrshare(params: AyrsharePostParams): Promise<AyrsharePostResult> {
  const body: Record<string, any> = {
    post: params.post,
    platforms: params.platforms,
  };
  if (params.mediaUrls?.length) body.mediaUrls = params.mediaUrls;
  if (params.scheduleDate) body.scheduleDate = params.scheduleDate;

  const res = await fetch(`${BASE}/post`, {
    method: 'POST',
    headers: headers(params.profileKey),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Ayrshare post failed: ${JSON.stringify(data)}`);
  }
  return data as AyrsharePostResult;
}

// ─── Delete a user profile ───────────────────────────────────────────────────

export async function deleteAyrshareProfile(profileKey: string): Promise<void> {
  await fetch(`${BASE}/profiles`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ profileKey }),
  });
}
