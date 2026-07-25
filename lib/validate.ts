// Input validation utilities

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LENGTH) return false;
  return EMAIL_REGEX.test(email);
}

export function isValidPassword(password: string): boolean {
  if (!password) return false;
  if (password.length < MIN_PASSWORD_LENGTH) return false;
  if (password.length > MAX_PASSWORD_LENGTH) return false;
  return true;
}

export function sanitizeString(input: string, maxLength: number = MAX_NAME_LENGTH): string {
  if (!input) return '';
  // Remove any HTML tags and trim
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`;]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeHandle(handle: string): string {
  if (!handle) return '';
  let clean = handle.trim().toLowerCase();
  // Remove anything that isn't alphanumeric, underscore, dot, or @
  clean = clean.replace(/[^a-z0-9_.@]/g, '');
  if (!clean.startsWith('@')) clean = '@' + clean;
  return clean.slice(0, 50);
}

export function validateRegistrationInput(body: any): { valid: boolean; error?: string } {
  if (!body.fullName || typeof body.fullName !== 'string' || body.fullName.trim().length < 2) {
    return { valid: false, error: 'Укажите полное имя (минимум 2 символа)' };
  }
  if (!isValidEmail(body.email)) {
    return { valid: false, error: 'Укажите корректный email адрес' };
  }
  if (!isValidPassword(body.password)) {
    return { valid: false, error: 'Пароль должен содержать минимум 8 символов' };
  }
  if (!body.role || !['INFLUENCER', 'BRAND'].includes(body.role)) {
    return { valid: false, error: 'Укажите тип аккаунта (INFLUENCER или BRAND)' };
  }
  if (body.role === 'INFLUENCER' && body.handle) {
    const cleaned = body.handle.replace(/[^a-zA-Z0-9_.@]/g, '');
    if (cleaned.length < 2) {
      return { valid: false, error: 'Укажите корректный TikTok хэндл' };
    }
  }
  return { valid: true };
}
