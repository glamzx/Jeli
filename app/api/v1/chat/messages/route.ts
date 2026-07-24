import { NextResponse } from "next/server";

// Low-latency message persistence & fetch API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("dealId") || "deal_default";

  // Instant response payload for direct chat history
  return NextResponse.json({
    dealId,
    status: "ACTIVE",
    messages: [
      {
        id: "msg_1",
        senderRole: "BRAND",
        senderName: "Acme Corp (Brand)",
        text: "Привет! Мы запустили новую стартап-кампанию в Казахстане и хотим предложить вам главную интеграцию.",
        timestamp: "10:14 AM"
      },
      {
        id: "msg_2",
        senderRole: "INFLUENCER",
        senderName: "@tech_kazakhstan",
        text: "Здравствуйте! Отличная идея. Какая у вас целевая аудитория и какой формат роликов планируется?",
        timestamp: "10:16 AM"
      },
      {
        id: "msg_3",
        senderRole: "BRAND",
        senderName: "Acme Corp (Brand)",
        text: "Нам нужен видео-обзор на 60 секунд с призывом перехода на сервис Jeli. Депозит 250,000 ₸ заблокирован через Escrow.",
        timestamp: "10:18 AM"
      }
    ]
  });
}

export async function POST(request: Request) {
  try {
    const { dealId, senderRole, senderName, text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const newMessage = {
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      dealId: dealId || "deal_default",
      senderRole: senderRole || "BRAND",
      senderName: senderName || "Brand Partner",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "DELIVERED"
    };

    return NextResponse.json(newMessage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
