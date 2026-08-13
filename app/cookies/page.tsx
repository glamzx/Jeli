import Link from 'next/link';

export const metadata = {
  title: 'Файлы cookie | Jeli',
  description: 'Информация об использовании файлов cookie на Jeli.'
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] px-6 py-10 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#0064FF] hover:underline">Назад на главную</Link>
        <h1 className="mt-6 text-3xl font-extrabold">Файлы cookie Jeli</h1>
        <p className="mt-2 text-sm text-slate-500">Последнее обновление: 25 июля 2026 г.</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <p>Jeli использует необходимые cookie для сохранения входа, защиты сессии и корректной работы TikTok OAuth.</p>
          <p>Cookie-сессия хранится в защищенном HttpOnly формате и не используется для рекламного отслеживания. Настройки темы и согласия на cookie могут храниться в браузере.</p>
          <p>Удаление cookie приведет к выходу из аккаунта на этом устройстве. Сведения о персональных данных доступны в <Link href="/privacy" className="text-[#0064FF] underline">политике конфиденциальности</Link>.</p>
        </div>
      </article>
    </main>
  );
}
