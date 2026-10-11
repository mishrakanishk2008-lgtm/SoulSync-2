// Spotify PKCE OAuth & Search API Helper for SoulSync
export const SPOTIFY_CLIENT_ID = 'b9b27e38137348718f6c6d6774655b6b';

const SPOTIFY_AUTH_KEY = 'soulsync_spotify_auth';
const SPOTIFY_VERIFIER_KEY = 'soulsync_spotify_code_verifier';

export interface SpotifyAuthData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface SpotifySearchResultTrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

// Generate PKCE code verifier and challenge
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(a))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function getRedirectUri(): string {
  return window.location.origin;
}

// Initiate Spotify Login Popup
export async function initiateSpotifyLogin(): Promise<Window | null> {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlencode(hashed);

  localStorage.setItem(SPOTIFY_VERIFIER_KEY, codeVerifier);

  const redirectUri = getRedirectUri();
  const scope = 'user-read-private user-read-email';

  const authUrl =
    `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&scope=${encodeURIComponent(scope)}`;

  // Open Spotify Auth URL directly in popup as per OAuth skill requirements
  const popup = window.open(authUrl, 'spotify_oauth', 'width=600,height=750');
  if (!popup) {
    window.location.href = authUrl;
  }
  return popup;
}

// Exchange authorization code for Spotify tokens
export async function exchangeCodeForToken(code: string): Promise<SpotifyAuthData> {
  const codeVerifier = localStorage.getItem(SPOTIFY_VERIFIER_KEY) || '';
  const redirectUri = getRedirectUri();

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Spotify token exchange failed: ${errText}`);
  }

  const data = await res.json();
  const authData: SpotifyAuthData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  saveSpotifyAuth(authData);
  localStorage.removeItem(SPOTIFY_VERIFIER_KEY);
  return authData;
}

// Refresh access token if expired
export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyAuthData> {
  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    clearSpotifyAuth();
    throw new Error('Spotify token refresh failed');
  }

  const data = await res.json();
  const authData: SpotifyAuthData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  saveSpotifyAuth(authData);
  return authData;
}

export function getSpotifyAuth(): SpotifyAuthData | null {
  const raw = localStorage.getItem(SPOTIFY_AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSpotifyAuth(auth: SpotifyAuthData): void {
  localStorage.setItem(SPOTIFY_AUTH_KEY, JSON.stringify(auth));
}

export function clearSpotifyAuth(): void {
  localStorage.removeItem(SPOTIFY_AUTH_KEY);
}

// Get valid access token (auto-refreshing if needed)
export async function getValidAccessToken(): Promise<string | null> {
  const auth = getSpotifyAuth();
  if (!auth || !auth.accessToken) return null;

  // Buffer 2 minutes
  if (Date.now() >= auth.expiresAt - 120000) {
    if (auth.refreshToken) {
      try {
        const refreshed = await refreshSpotifyToken(auth.refreshToken);
        return refreshed.accessToken;
      } catch {
        return null;
      }
    }
    return null;
  }

  return auth.accessToken;
}

// Search tracks via Spotify Web API
export async function searchSpotifyTracks(query: string): Promise<SpotifySearchResultTrack[]> {
  if (!query.trim()) return [];

  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('NOT_CONNECTED');
  }

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401) {
    clearSpotifyAuth();
    throw new Error('NOT_CONNECTED');
  }

  if (!res.ok) {
    throw new Error('Spotify search failed');
  }

  const data = await res.json();
  const items = data.tracks?.items || [];

  return items.map((item: any) => ({
    id: item.id,
    title: item.name,
    artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
    albumArt: item.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
    spotifyUrl: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`,
  }));
}
