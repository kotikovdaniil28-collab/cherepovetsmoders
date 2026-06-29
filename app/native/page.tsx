const cards = [
  {
    title: "Профиль",
    text: "Игровой XP, Real XP, роли и быстрый вход в рабочие разделы.",
    href: "/native/profile"
  },
  {
    title: "Сдать отчёт",
    text: "Новая форма отчёта с тем же форматом данных, который понимает старый сайт.",
    href: "/native/reports"
  },
  {
    title: "Неактив",
    text: "Подача неактива в старую таблицу reports / INACTIVE_REQ.",
    href: "/native/inactives"
  },
  {
    title: "Таблица",
    text: "Недельная сетка модераторов, отчётов, неактивов и Real XP.",
    href: "/native/table"
  },
  {
    title: "Проверка",
    text: "Проверка отчётов руководством и обновление статусов.",
    href: "/native/review"
  },
  {
    title: "Лидерборд",
    text: "Рейтинг модерации и АП напрямую из новой Supabase-базы.",
    href: "/native/leaderboard"
  }
];

export const dynamic = "force-dynamic";

export default function NativeHomePage() {
  return (
    <main className="ch-native-home">
      <section className="ch-native-hero">
        <p>NATIVE SITE</p>
        <h1>Рабочая панель модерации</h1>
        <span>
          Новые разделы Next вынесены в единый интерфейс. Старый сайт пока остаётся резервом,
          чтобы функции не терялись во время переноса.
        </span>
      </section>
      <section className="ch-native-grid" aria-label="Native sections">
        {cards.map((card) => (
          <a className="ch-native-card" href={card.href} key={card.href}>
            <strong>{card.title}</strong>
            <span>{card.text}</span>
          </a>
        ))}
      </section>
    </main>
  );
}
