import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase';
import { verifyPassword } from '@/lib/crypto';
import { isValidEmail } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Введите email и пароль' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Укажите корректный email адрес' },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supabase Admin не настроен. Добавьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в переменные окружения.'
        },
        { status: 503 }
      );
    }

    // 1. Fetch user from public.users table
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, full_name, role, status, avatar_url')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (userErr || !user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь с таким email не найден' },
        { status: 404 }
      );
    }

    // 2. Check status
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, message: 'Ваш аккаунт заблокирован. Обратитесь в поддержку.' },
        { status: 403 }
      );
    }

    // 3. Verify Password using Web Crypto PBKDF2
    let isPasswordValid = false;
    if (user.password_hash) {
      isPasswordValid = await verifyPassword(password, user.password_hash);
    }

    // Fallback check against Supabase Auth if password_hash match failed or wasn't set
    if (!isPasswordValid) {
      try {
        const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });
        if (authData?.user && !authErr) {
          isPasswordValid = true;
        }
      } catch (authErr) {
        // Auth check fallback failed
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Неверный пароль. Проверьте правильность ввода.' },
        { status: 401 }
      );
    }

    // 4. Fetch additional role details if needed
    let profileData: any = null;
    if (user.role === 'INFLUENCER') {
      const { data: infProf } = await supabaseAdmin
        .from('influencer_profiles')
        .select('*, social_accounts(*)')
        .eq('user_id', user.id)
        .maybeSingle();
      profileData = infProf;
    } else {
      const { data: brandProf } = await supabaseAdmin
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      profileData = brandProf;
    }

    return NextResponse.json({
      success: true,
      message: 'Успешная авторизация',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        profile: profileData
      }
    });

  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при входе: ' + (error.message || 'Внутренняя ошибка') },
      { status: 500 }
    );
  }
}
