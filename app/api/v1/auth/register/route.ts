import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    // 2. Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Аккаунт с таким email уже существует' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(body.password);

    // 4. Register in Supabase Auth
    let supabaseAuthId: string | null = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: body.password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      if (authData?.user) {
        supabaseAuthId = authData.user.id;
      }
      if (authError) {
        console.warn('Supabase Auth notice:', authError.message);
      }
    } catch (authErr) {
      console.warn('Supabase Auth exception (non-blocking):', authErr);
    }

    // 5. Insert user into public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: cleanEmail,
        full_name: fullName,
        password_hash: passwordHash,
        role: role,
        status: 'ACTIVE',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('User insert error:', userError);
      return NextResponse.json(
        { success: false, message: 'Ошибка при создании аккаунта: ' + (userError?.message || 'unknown') },
        { status: 500 }
      );
    }

    const userId = userData.id;

    // 6. Create role-specific profile
    if (role === 'INFLUENCER') {
      // Create influencer profile — followers start at 0 until TikTok is linked
      const { data: profileData, error: profileError } = await supabase
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

      // Create placeholder social account — will be updated when TikTok is linked
      if (profileData && cleanHandle) {
        const { error: socialError } = await supabase
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
      // Create brand profile
      const { error: brandError } = await supabase
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
      message: 'Аккаунт успешно создан',
      user: {
        id: userId,
        email: cleanEmail,
        fullName: fullName,
        role: role,
        status: 'ACTIVE',
        tiktokLinked: false
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
