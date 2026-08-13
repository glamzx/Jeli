import Link from 'next/link';

export const metadata = {
  title: 'Условия использования | Jeli',
  description: 'Условия использования платформы Jeli.'
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] px-6 py-10 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#0064FF] hover:underline">
          Назад на главную
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold">Условия использования Jeli</h1>
        <p className="mt-2 text-sm text-slate-500">Последнее обновление: 25 июля 2026 г.</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. О платформе</h2>
            <p>Jeli - платформа для поиска и взаимодействия бизнеса и инфлюенсеров. Она помогает создавать профили, находить подходящих партнеров и управлять сотрудничеством.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Учетная запись</h2>
            <p>Пользователь обязан предоставлять точные сведения при регистрации и сохранять доступ к своей учетной записи в безопасности. Запрещается выдавать себя за другое лицо или использовать платформу в незаконных целях.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">3. Подключение TikTok</h2>
            <p>При добровольном подключении TikTok Jeli получает только разрешенные пользователем данные в соответствии с выбранными разрешениями TikTok. Подключение можно отозвать в настройках Jeli или через настройки TikTok.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Контент и правила использования</h2>
            <p>Пользователь несет ответственность за информацию, которую размещает на Jeli, и должен соблюдать применимое законодательство, права третьих лиц и правила подключенных платформ.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">5. Изменения и прекращение доступа</h2>
            <p>Jeli может обновлять платформу и эти условия. При существенных изменениях новая редакция будет опубликована на этой странице. Доступ может быть ограничен при нарушении условий или требований закона.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">6. Контакты</h2>
            <p>По вопросам об условиях использования напишите команде Jeli через страницу поддержки или официальные контакты, указанные в приложении.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
