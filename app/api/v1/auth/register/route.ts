import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, role, handle, niche, companyName, websiteUrl, budget } = body;

    if (!email || !role) {
      return NextResponse.json({ message: "Missing email or role" }, { status: 400 });
    }

    // Return successful account creation session payload
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        email,
        fullName,
        role,
        status: "ACTIVE",
        profileDetails: role === "INFLUENCER" 
          ? { handle, niche } 
          : { companyName, websiteUrl, budget }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 500 });
  }
}
