import Link from 'next/link';

export const metadata = {
  title: 'Политика использования файлов Cookie | Jeli',
  description: 'Информация об использовании файлов Cookie на платформе Jeli.'
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#05070A] text-slate-100 font-sans px-6 py-10 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="relative z-10 mx-auto max-w-3xl glass-card-dark border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
        <Link href="/" className="text-xs font-bold text-[#0064FF] hover:underline font-pixel">
          ← НАЗАД НА ГЛАВНУЮ
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Политика Cookie Jeli</h1>
          <p className="mt-1 text-xs text-slate-400">Последнее обновление: 2026 г.</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-slate-300">
          <section>
            <h2 className="text-sm font-bold text-white mb-1">1. Что такое файлы Cookie</h2>
            <p>Мы используем файлы Cookie для сохранения вашей сессии авторизации, языковых предпочтений и работы аналитики Gemini AI.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
