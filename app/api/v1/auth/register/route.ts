import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/crypto';
import { validateRegistrationInput, sanitizeString, sanitizeHandle } from '@/lib/validate';

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

    if (!isSupabaseAdminConfigured) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supabase Admin не настроен. Добавьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в переменные окружения.'
        },
        { status: 503 }
      );
    }

    // 2. Check if user already exists in public.users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Аккаунт с таким email уже существует в базе данных' },
        { status: 409 }
      );
    }

    // 3. Hash password for local database security
    const passwordHash = await hashPassword(body.password);

    // 4. Create User DIRECTLY in Supabase Auth (auth.users) using Service Role Admin API
    let authUserId: string | null = null;
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: role,
          handle: cleanHandle,
          niche: niche,
          company_name: companyName
        }
      });

      if (authData?.user) {
        authUserId = authData.user.id;
        console.log(`Successfully created user in Supabase Auth (auth.users): ${authUserId}`);
      } else if (authError) {
        console.warn('Supabase Auth Admin create warning:', authError.message);
      }
    } catch (authErr: any) {
      console.warn('Supabase Auth Admin exception:', authErr.message);
    }

    // 5. Insert user into public.users table (using auth.users UUID if available, or auto-generated UUID)
    const userPayload: any = {
      email: cleanEmail,
      full_name: fullName,
      password_hash: passwordHash,
      role: role,
      status: 'ACTIVE',
      updated_at: new Date().toISOString()
    };
    if (authUserId) {
      userPayload.id = authUserId;
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert(userPayload)
      .select()
      .single();

    if (userError || !userData) {
      console.error('User insert error in public.users:', userError);
      return NextResponse.json(
        { success: false, message: 'Ошибка при сохранении пользователя: ' + (userError?.message || 'unknown') },
        { status: 500 }
      );
    }

    const userId = userData.id;

    // 6. Create role-specific profile (Influencer or Brand)
    if (role === 'INFLUENCER') {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('influencer_profiles')
        .insert({
          user_id: userId,
          bio: `Инфлюенсер в категории ${niche}`,
          niches: [niche],
          primary_country: 'Казахстан'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile insert error:', profileError);
      }

      // Create initial social account record
      if (profileData && cleanHandle) {
        const { error: socialError } = await supabaseAdmin
          .from('social_accounts')
          .insert({
            influencer_id: profileData.id,
            platform: 'TIKTOK',
            handle: cleanHandle,
            platform_user_id: cleanHandle.replace('@', ''),
            follower_count: 0,
            engagement_rate: 0
          });

        if (socialError) {
          console.error('Social account insert error:', socialError);
        }
      }
    } else {
      // Create Brand profile
      const { error: brandError } = await supabaseAdmin
        .from('brand_profiles')
        .insert({
          user_id: userId,
          company_name: companyName || fullName,
          website_url: websiteUrl,
          industry: niche || 'Бизнес & Маркетинг',
          monthly_budget: budget || '250,000 ₸ – 1,000,000 ₸'
        });

      if (brandError) {
        console.error('Brand profile insert error:', brandError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован в Supabase Auth и PostgreSQL',
      user: {
        id: userId,
        email: cleanEmail,
        fullName: fullName,
        role: role,
        status: 'ACTIVE',
        inSupabaseAuth: !!authUserId
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера: ' + error.message },
      { status: 500 }
    );
  }
}
