import Link from 'next/link';

export const metadata = {
  title: 'Условия использования | Jeli',
  description: 'Пользовательское соглашение и условия использования платформы Jeli.'
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#05070A] text-slate-100 font-sans px-6 py-10 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="relative z-10 mx-auto max-w-3xl glass-card-dark border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
        <Link href="/" className="text-xs font-bold text-[#0064FF] hover:underline font-pixel">
          ← НАЗАД НА ГЛАВНУЮ
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Условия использования Jeli</h1>
          <p className="mt-1 text-xs text-slate-400">Последнее обновление: 2026 г.</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-slate-300">
          <section>
            <h2 className="text-sm font-bold text-white mb-1">1. Предмет соглашения</h2>
            <p>Платформа Jeli предоставляет сервис автоматизированного подбора инфлюенсеров и безопасного проведения маркетинговых сделок через гарантийный механизм Escrow.</p>
          </section>
          <section>
            <h2 className="text-sm font-bold text-white mb-1">2. Права и обязанности сторон</h2>
            <p>Бренды обязуются предоставлять достоверные технические задания и вовремя депонировать средства. Инфлюенсеры обязуются выполнять интеграции в соответствии с ТЗ.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
