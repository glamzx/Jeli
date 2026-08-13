import Link from 'next/link';

export const metadata = {
  title: 'Политика конфиденциальности | Jeli',
  description: 'Политика конфиденциальности платформы Jeli.'
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] px-6 py-10 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#0064FF] hover:underline">
          Назад на главную
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold">Политика конфиденциальности Jeli</h1>
        <p className="mt-2 text-sm text-slate-500">Последнее обновление: 25 июля 2026 г.</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. Какие данные мы обрабатываем</h2>
            <p>Jeli обрабатывает данные учетной записи и профиля, которые пользователь предоставляет при регистрации. При подключении TikTok мы также обрабатываем данные, доступ к которым пользователь явно разрешил через TikTok: отображаемое имя, идентификатор профиля, аватар, показатели профиля и метаданные недавних публичных видео, включая заголовок, описание, ссылку и показатели вовлеченности.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Как мы используем данные</h2>
            <p>Мы используем данные для работы учетной записи, отображения профиля, анализа тем недавнего контента, подбора потенциальных партнеров, подтверждения подключения TikTok и поддержки пользователей. Мы не продаем персональные данные.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">3. Данные TikTok</h2>
            <p>Токены доступа TikTok используются только для поддержания подключенной функции и хранятся в защищенной инфраструктуре. Пользователь может отключить TikTok в настройках Jeli; после отключения Jeli прекращает использовать токены для новых запросов.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Передача и хранение</h2>
            <p>Мы используем поставщиков инфраструктуры для хранения и обработки данных, необходимых для работы Jeli. Доступ к данным ограничивается тем, что необходимо для предоставления сервиса и соблюдения закона.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">5. Права пользователя</h2>
            <p>Пользователь может запросить доступ, исправление или удаление данных, а также отозвать разрешения TikTok. Для этого обратитесь в поддержку Jeli через официальные контакты, указанные в приложении.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">6. Изменения политики</h2>
            <p>Мы можем обновлять эту политику при изменении сервиса или требований законодательства. Актуальная версия всегда доступна по этому адресу.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
