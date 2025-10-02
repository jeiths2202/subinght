// YouTube OAuth 2.0 인증 유틸리티 (PKCE 방식)

interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

const OAUTH_CONFIG: OAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || window.location.origin,
  scopes: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ]
};

const OAUTH_ENDPOINTS = {
  authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  revoke: 'https://oauth2.googleapis.com/revoke'
};

// PKCE code verifier 생성
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// PKCE code challenge 생성
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// OAuth 2.0 인증 URL 생성 (Implicit Flow - access token 직접 받기)
export async function getOAuthUrl(): Promise<string> {
  console.log('OAuth Config:', {
    clientId: OAUTH_CONFIG.clientId,
    redirectUri: OAUTH_CONFIG.redirectUri,
    scopes: OAUTH_CONFIG.scopes
  });

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: 'token', // code 대신 token 직접 받기
    scope: OAUTH_CONFIG.scopes.join(' '),
    prompt: 'consent'
  });

  const url = `${OAUTH_ENDPOINTS.authorization}?${params.toString()}`;
  console.log('Generated OAuth URL:', url);
  console.log('Redirect URI in URL:', params.get('redirect_uri'));

  return url;
}

// Authorization code를 access token으로 교환 (PKCE)
export async function exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please restart the OAuth flow.');
  }

  const response = await fetch(OAUTH_ENDPOINTS.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: OAUTH_CONFIG.clientId,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`);
  }

  // code_verifier 삭제
  sessionStorage.removeItem('oauth_code_verifier');

  return response.json();
}

// Refresh token을 사용하여 새 access token 발급
export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
  const response = await fetch(OAUTH_ENDPOINTS.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: OAUTH_CONFIG.clientId,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

// Access token 저장
export function saveTokens(tokens: OAuthTokenResponse): void {
  const expiresAt = Date.now() + (tokens.expires_in * 1000);

  localStorage.setItem('youtube_access_token', tokens.access_token);
  localStorage.setItem('youtube_token_expires_at', expiresAt.toString());

  if (tokens.refresh_token) {
    localStorage.setItem('youtube_refresh_token', tokens.refresh_token);
  }
}

// 유효한 access token 가져오기 (만료시 자동 갱신)
export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = localStorage.getItem('youtube_access_token');
  const expiresAt = localStorage.getItem('youtube_token_expires_at');
  const refreshToken = localStorage.getItem('youtube_refresh_token');

  if (!accessToken) {
    return null;
  }

  // 토큰이 만료되지 않았으면 그대로 반환
  if (expiresAt && Date.now() < parseInt(expiresAt)) {
    return accessToken;
  }

  // 토큰이 만료되었고 refresh token이 있으면 갱신
  if (refreshToken) {
    try {
      const newTokens = await refreshAccessToken(refreshToken);
      saveTokens(newTokens);
      return newTokens.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      return null;
    }
  }

  return null;
}

// 저장된 토큰 모두 삭제
export function clearTokens(): void {
  localStorage.removeItem('youtube_access_token');
  localStorage.removeItem('youtube_refresh_token');
  localStorage.removeItem('youtube_token_expires_at');
}

// OAuth 인증 상태 확인
export async function isAuthenticated(): Promise<boolean> {
  const token = await getValidAccessToken();
  return token !== null;
}

// Access token 취소
export async function revokeAccess(): Promise<void> {
  const token = localStorage.getItem('youtube_access_token');

  if (token) {
    try {
      await fetch(`${OAUTH_ENDPOINTS.revoke}?token=${token}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Token revocation failed:', error);
    }
  }

  clearTokens();
}
