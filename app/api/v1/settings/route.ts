import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import { isValidEmail, sanitizeString } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// GET — fetch user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, status, avatar_url, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
    }

    // Fetch role-specific profile
    let profile: any = null;
    let socialAccounts: any[] = [];

    if (user.role === 'INFLUENCER') {
      const { data: infProfile } = await supabaseAdmin
        .from('influencer_profiles')
        .select('*, social_accounts(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (infProfile) {
        profile = {
          bio: infProfile.bio,
          niches: infProfile.niches,
          primaryCountry: infProfile.primary_country
        };
        socialAccounts = (infProfile.social_accounts || []).map((s: any) => ({
          id: s.id,
          platform: s.platform,
          handle: s.handle,
          followerCount: Number(s.follower_count || 0),
          engagementRate: Number(s.engagement_rate || 0),
          linked: !!s.access_token
        }));
      }
    } else {
      const { data: brandProfile } = await supabaseAdmin
        .from('brand_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (brandProfile) {
        profile = {
          companyName: brandProfile.company_name,
          websiteUrl: brandProfile.website_url,
          industry: brandProfile.industry,
          monthlyBudget: brandProfile.monthly_budget
        };
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      },
      profile,
      socialAccounts
    });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT — update user profile
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, fullName, email, currentPassword, newPassword, bio, niches, companyName, websiteUrl, industry, budget } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    // Fetch current user
    const { data: user, error: fetchErr } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, role')
      .eq('id', userId)
      .single();

    if (fetchErr || !user) {
      return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
    }

    // Build update payload for users table
    const userUpdate: any = { updated_at: new Date().toISOString() };

    if (fullName && typeof fullName === 'string' && fullName.trim().length >= 2) {
      userUpdate.full_name = sanitizeString(fullName);
    }

    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return NextResponse.json({ success: false, message: 'Укажите корректный email' }, { status: 400 });
      }
      // Check email uniqueness
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .neq('id', userId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: false, message: 'Email уже используется другим аккаунтом' }, { status: 409 });
      }
      userUpdate.email = email.toLowerCase().trim();
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: 'Введите текущий пароль для смены' }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ success: false, message: 'Новый пароль должен содержать минимум 8 символов' }, { status: 400 });
      }

      // Verify current password
      let currentValid = false;
      if (user.password_hash) {
        currentValid = await verifyPassword(currentPassword, user.password_hash);
      }
      if (!currentValid) {
        // Fallback to Supabase Auth
        try {
          const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
          });
          if (authData?.user && !authErr) currentValid = true;
        } catch {}
      }

      if (!currentValid) {
        return NextResponse.json({ success: false, message: 'Текущий пароль неверный' }, { status: 401 });
      }

      userUpdate.password_hash = await hashPassword(newPassword);

      // Update in Supabase Auth too
      try {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = authUsers?.users?.find((u: any) => u.email === user.email);
        if (authUser) {
          await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password: newPassword });
        }
      } catch (e) {
        console.warn('Supabase Auth password update warning:', e);
      }
    }

    // Update users table
    const { error: updateErr } = await supabaseAdmin
      .from('users')
      .update(userUpdate)
      .eq('id', userId);

    if (updateErr) {
      return NextResponse.json({ success: false, message: 'Ошибка обновления: ' + updateErr.message }, { status: 500 });
    }

    // Update role-specific profile
    if (user.role === 'INFLUENCER') {
      const profileUpdate: any = {};
      if (bio) profileUpdate.bio = sanitizeString(bio, 500);
      if (niches && Array.isArray(niches)) profileUpdate.niches = niches.slice(0, 5);

      if (Object.keys(profileUpdate).length > 0) {
        await supabaseAdmin
          .from('influencer_profiles')
          .update(profileUpdate)
          .eq('user_id', userId);
      }
    } else if (user.role === 'BRAND') {
      const profileUpdate: any = {};
      if (companyName) profileUpdate.company_name = sanitizeString(companyName, 100);
      if (websiteUrl) profileUpdate.website_url = websiteUrl.trim().slice(0, 200);
      if (industry) profileUpdate.industry = sanitizeString(industry, 50);
      if (budget) profileUpdate.monthly_budget = sanitizeString(budget, 50);

      if (Object.keys(profileUpdate).length > 0) {
        await supabaseAdmin
          .from('brand_profiles')
          .update(profileUpdate)
          .eq('user_id', userId);
      }
    }

    return NextResponse.json({ success: true, message: 'Настройки успешно обновлены' });
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE — delete user account
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json({ success: false, message: 'userId и пароль обязательны' }, { status: 400 });
    }

    // Fetch user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
    }

    // Verify password
    let valid = false;
    if (user.password_hash) {
      valid = await verifyPassword(password, user.password_hash);
    }
    if (!valid) {
      try {
        const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
          email: user.email,
          password: password
        });
        if (authData?.user && !authErr) valid = true;
      } catch {}
    }

    if (!valid) {
      return NextResponse.json({ success: false, message: 'Неверный пароль' }, { status: 401 });
    }

    // Delete from Supabase Auth
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = authUsers?.users?.find((u: any) => u.email === user.email);
      if (authUser) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      }
    } catch (e) {
      console.warn('Auth deletion warning:', e);
    }

    // Delete from database (cascade should handle profiles)
    await supabaseAdmin.from('users').delete().eq('id', userId);

    return NextResponse.json({ success: true, message: 'Аккаунт удалён' });
  } catch (error: any) {
    console.error('Settings DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
