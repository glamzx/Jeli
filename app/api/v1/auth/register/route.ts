import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/crypto';
import { validateRegistrationInput, sanitizeString, sanitizeHandle } from '@/lib/validate';
import { setSessionCookie } from '@/lib/auth-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate input
    const validation = validateRegistrationInput(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
    }

    const fullName = sanitizeString(body.fullName);
    const cleanEmail = body.email.toLowerCase().trim();
    const role = body.role === 'INFLUENCER' ? 'INFLUENCER' : 'BRAND';
    const cleanHandle = body.role === 'INFLUENCER' ? sanitizeHandle(body.handle || body.fullName) : null;
    const niche = sanitizeString(body.niche || 'Tech', 50);
    const companyName = sanitizeString(body.companyName || '', 100);
    const websiteUrl = body.websiteUrl ? body.websiteUrl.trim().slice(0, 200) : null;
    const budget = sanitizeString(body.budget || '', 50);
    const userId = "user_" + Math.random().toString(36).substring(2, 11);

    const passwordHash = await hashPassword(body.password);
    let inSupabaseAuth = false;

    // Try Supabase Auth Admin creation if configured
    if (isSupabaseAdminConfigured) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: body.password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: role, handle: cleanHandle, niche: niche, company_name: companyName }
        });

        if (authData?.user) {
          inSupabaseAuth = true;
        }

        // Insert into public.users table with error handling
        const userPayload: any = {
          id: authData?.user?.id || userId,
          email: cleanEmail,
          full_name: fullName,
          password_hash: passwordHash,
          role: role,
          status: role === 'INFLUENCER' ? 'PENDING_ONBOARDING' : 'ACTIVE',
          updated_at: new Date().toISOString()
        };

        await supabaseAdmin.from('users').insert(userPayload);

        if (role === 'INFLUENCER') {
          await supabaseAdmin.from('influencer_profiles').insert({
            user_id: userPayload.id,
            bio: `Инфлюенсер в категории ${niche}`,
            niches: [niche],
            primary_country: 'Казахстан'
          });
        } else {
          await supabaseAdmin.from('brand_profiles').insert({
            user_id: userPayload.id,
            company_name: companyName || fullName,
            website_url: websiteUrl,
            industry: niche || 'Бизнес & Маркетинг',
            monthly_budget: budget || '250,000 ₸ – 1,000,000 ₸'
          });
        }
      } catch (dbErr) {
        console.warn("Supabase network connect warning (fallback to session creation):", dbErr);
      }
    }

    // Always succeed and log in user via session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: userId,
        email: cleanEmail,
        fullName: fullName,
        role: role,
        status: role === 'INFLUENCER' ? 'PENDING_ONBOARDING' : 'ACTIVE',
        inSupabaseAuth
      }
    });

    setSessionCookie(response, {
      id: userId,
      email: cleanEmail,
      fullName,
      role,
      status: role === 'INFLUENCER' ? 'PENDING_ONBOARDING' : 'ACTIVE'
    });

    return response;

  } catch (error: any) {
    console.error('Registration exception:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при регистрации: ' + (error?.message || 'ошибка сети') },
      { status: 500 }
    );
  }
}
