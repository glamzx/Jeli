import Link from 'next/link';

export const metadata = {
  title: 'Политика конфиденциальности | Jeli',
  description: 'Политика конфиденциальности платформы Jeli.'
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#05070A] text-slate-100 font-sans px-6 py-10 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="relative z-10 mx-auto max-w-3xl glass-card-dark border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
        <Link href="/" className="text-xs font-bold text-[#0064FF] hover:underline font-pixel">
          ← НАЗАД НА ГЛАВНУЮ
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Политика конфиденциальности Jeli</h1>
          <p className="mt-1 text-xs text-slate-400">Последнее обновление: 2026 г.</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-slate-300">
          <section>
            <h2 className="text-sm font-bold text-white mb-1">1. Какие данные мы обрабатываем</h2>
            <p>Jeli обрабатывает данные учетной записи и профиля, которые пользователь предоставляет при регистрации. При подключении TikTok мы также обрабатываем данные, доступ к которым пользователь явно разрешил через TikTok: отображаемое имя, идентификатор профиля, аватар, показатели профиля и метаданные недавних публичных видео, включая заголовок, описание, ссылку и показатели вовлеченности.</p>
          </section>
          <section>
            <h2 className="text-sm font-bold text-white mb-1">2. Как мы используем данные</h2>
            <p>Мы используем данные для работы учетной записи, отображения профиля, анализа тем недавнего контента, подбора потенциальных партнеров, подтверждения подключения TikTok и поддержки пользователей. Мы не продаем персональные данные.</p>
          </section>
          <section>
            <h2 className="text-sm font-bold text-white mb-1">3. Безопасность и Escrow</h2>
            <p>Все транзакции защищены гарантийным модулем Escrow. Данные о платежах передаются по шифрованным каналам согласно стандартам PCI-DSS.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
