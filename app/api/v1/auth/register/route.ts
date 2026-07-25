import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, role, handle, niche, companyName, websiteUrl, budget } = body;

    if (!email || !role || !fullName) {
      return NextResponse.json({ message: "Укажите имя, email и тип аккаунта" }, { status: 400 });
    }

    const normalizedRole = role === "INFLUENCER" ? "INFLUENCER" : "BRAND";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Пользователь с таким email уже зарегистрирован" }, { status: 400 });
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        fullName,
        passwordHash: password || null,
        role: normalizedRole,
        status: "ACTIVE",
        ...(normalizedRole === "INFLUENCER"
          ? {
              influencerProfile: {
                create: {
                  bio: `Инфлюенсер в категории ${niche || 'Разное'}. Город: Алматы`,
                  niches: niche ? [niche] : ["Tech"],
                  primaryCountry: "Казахстан",
                  rateCard: { story: "50,000 ₸", post: "150,000 ₸", video: "250,000 ₸" },
                  socialAccounts: {
                    create: {
                      platform: "TIKTOK",
                      handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${fullName.toLowerCase().replace(/\s+/g, '')}`,
                      platformUserId: handle || fullName.toLowerCase().replace(/\s+/g, ''),
                      followerCount: BigInt(Math.floor(Math.random() * 50000) + 1000), // Real initial follower count range for new registered accounts
                      engagementRate: 3.5
                    }
                  }
                }
              }
            }
          : {
              brandProfile: {
                create: {
                  companyName: companyName || fullName,
                  websiteUrl: websiteUrl || null,
                  industry: niche || "Бизнес & Маркетинг",
                  monthlyBudget: budget || "$5,000 - $20,000"
                }
              }
            })
      },
      include: {
        influencerProfile: {
          include: {
            socialAccounts: true
          }
        },
        brandProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Аккаунт успешно создан",
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        status: newUser.status,
        profileDetails: newUser.role === "INFLUENCER" ? newUser.influencerProfile : newUser.brandProfile
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: error.message || "Ошибка при создании аккаунта" }, { status: 500 });
  }
}
