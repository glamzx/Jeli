"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TikTokAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Завершаем настройку аккаунта Jeli...");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const error = searchParams.get("reason");

    if (error || !userId) {
      setMessage(error ? `Не удалось завершить вход: ${error}` : "Не удалось определить аккаунт Jeli.");
      return;
    }

    fetch(`/api/v1/settings?userId=${encodeURIComponent(userId)}`)
      .then(response => response.json())
      .then(data => {
        if (!data.success || !data.user) throw new Error("profile_unavailable");
        localStorage.setItem("jeli_user", JSON.stringify(data.user));
        router.replace("/dashboard");
      })
      .catch(() => setMessage("Аккаунт TikTok подключен, но профиль Jeli не удалось загрузить. Попробуйте войти снова."));
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-6 text-center text-slate-900">
      <div className="max-w-md">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-[#0064FF]" />
        <h1 className="text-xl font-bold">{message}</h1>
      </div>
    </main>
  );
}

export default function TikTokAuthSuccessPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]" />}>
      <TikTokAuthSuccessContent />
    </Suspense>
  );
}
