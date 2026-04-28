const MOBILE_AUTH_HOST = 'analytics.deodap.in';
const MOBILE_AUTH_PATH = '/api/auth/mobile-complete';

export interface AuthCallbackParams {
  token: string;
  shop?: string;
}

export function parseAuthCallbackUrl(
  url: string | null | undefined,
): AuthCallbackParams | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const isMobileAuthCallback =
      parsedUrl.protocol === 'https:' &&
      parsedUrl.host === MOBILE_AUTH_HOST &&
      parsedUrl.pathname.startsWith(MOBILE_AUTH_PATH);

    if (!isMobileAuthCallback) {
      return null;
    }

    const token = parsedUrl.searchParams.get('token');
    if (!token) {
      return null;
    }

    const shop = parsedUrl.searchParams.get('shop') || undefined;
    return { token, shop };
  } catch {
    return null;
  }
}
