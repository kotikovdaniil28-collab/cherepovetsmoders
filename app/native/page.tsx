const cards = [
  {
    icon: "◎",
    eyebrow: "Личный кабинет",
    title: "Профиль",
    text: "Должность, отчёты, XP и живой прогресс до следующего повышения.",
    href: "/native/profile"
  },
  {
    icon: "＋",
    eyebrow: "Ежедневная работа",
    title: "Сдать отчёт",
    text: "Новая форма отчёта с тем же форматом данных, который понимает старый сайт.",
    href: "/native/reports"
  },
  {
    icon: "◷",
    eyebrow: "График",
    title: "Неактив",
    text: "Подача неактива в старую таблицу reports / INACTIVE_REQ.",
    href: "/native/inactives"
  },
  {
    icon: "▦",
    eyebrow: "Аналитика",
    title: "Таблица",
    text: "Недельная сетка модераторов, отчётов, неактивов и Real XP.",
    href: "/native/table"
  },
  {
    icon: "✓",
    eyebrow: "Для руководства",
    title: "Проверка",
    text: "Проверка отчётов руководством и обновление статусов.",
    href: "/native/review"
  },
  {
    icon: "↗",
    eyebrow: "Рейтинг",
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
        <p>CHEREPOVETS · STAFF OS</p>
        <h1>Вся работа команды в одном месте</h1>
        <span>
          Отчётность, решения руководства, карьерный путь и статистика — быстро, понятно и без
          лишних переходов.
        </span>
      </section>
      <section className="ch-native-grid" aria-label="Native sections">
        {cards.map((card) => (
          <a className="ch-native-card" href={card.href} key={card.href}>
            <div className="ch-native-card-icon">{card.icon}</div>
            <small>{card.eyebrow}</small>
            <strong>{card.title}</strong>
            <span>{card.text}</span>
          </a>
        ))}
      </section>
    </main>
  );
}
