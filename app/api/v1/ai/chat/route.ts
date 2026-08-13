import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here") {
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/' + (process.env.GEMINI_MODEL || 'gemini-2.0-flash') + ':generateContent',
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Вы — профессиональный AI Менеджер платформы Jeli в Казахстане. Отвечайте вежливо, компетентно и по делу на русском языке. Запрос пользователя: "${message}"`
                    }
                  ]
                }
              ]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiReply) {
            return NextResponse.json({ reply: aiReply });
          }
        }
      } catch (err) {
        console.error("Gemini API Chat error:", err);
      }
    }

    return NextResponse.json({
      reply: 'Gemini AI сейчас недоступен, поэтому я не буду выдумывать рекомендации. Повторите запрос позже.',
      aiAvailable: false
    }, { status: 503 });

  } catch (error: any) {
    return NextResponse.json({ error: "AI Chat error", details: error.message }, { status: 500 });
  }
}
