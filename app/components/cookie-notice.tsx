"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(document.cookie.indexOf('jeli_cookie_consent=') === -1);
  }, []);

  const accept = () => {
    document.cookie = 'jeli_cookie_consent=accepted; Max-Age=31536000; Path=/; SameSite=Lax';
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <p>Мы используем необходимые cookie для входа и защиты сессии. <Link href="/cookies" className="font-semibold text-[#0064FF] underline">Подробнее</Link></p>
      <button onClick={accept} className="shrink-0 rounded-xl bg-[#0064FF] px-4 py-2 font-bold text-white hover:bg-blue-600">Понятно</button>
    </div>
  );
}
