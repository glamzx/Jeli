import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE = 'jeli_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export interface SessionUser {
  id: string;
  email: string;
  fullName?: string;
  role?: 'INFLUENCER' | 'BRAND' | 'ADMIN';
  status?: string;
  avatarUrl?: string;
}

function secret() {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'jeli-session-secret';
}

function encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionValue(user: SessionUser) {
  const payload = encode(JSON.stringify({ ...user, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(value?: string | null): SessionUser | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.id || !parsed.email) return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: Response & { cookies?: { set: (name: string, value: string, options: Record<string, unknown>) => void } }, user: SessionUser) {
  response.cookies?.set(SESSION_COOKIE, createSessionValue(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });
}

export function clearSessionCookie(response: Response & { cookies?: { set: (name: string, value: string, options: Record<string, unknown>) => void } }) {
  response.cookies?.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}
