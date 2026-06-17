const icons = {
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path>',
  clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
  shop: '<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h8"></path><path d="M8 17h8"></path>',
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  play: '<polygon points="5 3 19 12 5 21 5 3"></polygon>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  ban: '<circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path>',
  spark: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>',
  chart: '<line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line>',
  arrow: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>'
};

const pages = [
  { id: 'main', title: 'Тренажёр', subtitle: 'Мобильная панель для патруля, XP и быстрых решений.', icon: icons.shield },
  { id: 'timed', title: 'На время', subtitle: 'Быстрые кейсы с таймером и оценкой реакции.', icon: icons.clock },
  { id: 'complaints', title: 'Жалобы', subtitle: 'Очередь обращений, доказательства и статусы рассмотрения.', icon: icons.alert },
  { id: 'shop', title: 'Магазин', subtitle: 'Витрина наград, бустов и косметики для команды.', icon: icons.shop },
  { id: 'reports', title: 'Отчётность', subtitle: 'Итоги смен, наказания и качество решений.', icon: icons.file },
  { id: 'management', title: 'Руководство', subtitle: 'Команда, роли, расписание и контроль доступа.', icon: icons.team }
];

let currentPage = 'main';

const svg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

function $(id) {
  return document.getElementById(id);
}

function renderNavigation() {
  const navs = [$('desktopNav'), $('mobileNav')].filter(Boolean);
  navs.forEach((nav) => {
    nav.innerHTML = pages.map((page) => {
      const isActive = page.id === currentPage;
      return `
        <button class="nav-item ${isActive ? 'active' : ''}" type="button" data-page="${page.id}" aria-current="${isActive ? 'page' : 'false'}">
          ${svg(page.icon)}
          <span>${page.title}</span>
        </button>
      `;
    }).join('');

    nav.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => loadPage(button.dataset.page));
    });
  });
}

function setHero(page) {
  $('pageTitle').textContent = page.title;
  $('pageSubtitle').textContent = page.subtitle;
}

function loadPage(id) {
  currentPage = id;
  const page = pages.find((item) => item.id === id) || pages[0];
  setHero(page);
  renderNavigation();
  const container = $('pageContainer');
  container.style.opacity = '0';
  setTimeout(() => {
    container.innerHTML = templates[id] ? templates[id]() : templates.default();
    container.style.opacity = '1';
  }, 120);
}

const templates = {
  main: () => `
    <div class="section-grid">
      <section class="card padded">
        <p class="eyebrow">Активная цель</p>
        <h2>Повышение до Модератора</h2>
        <p>Осталось 200 XP. Решайте кейсы, закрывайте жалобы и держите точность выше 90%, чтобы открыть следующий ранг.</p>
        <div class="progress-track"><div class="progress-bar" style="width: 75%"></div></div>
        <div class="progress-meta"><span>Мл. модератор · 600 XP</span><span>Модератор · 800 XP</span></div>
        <div class="action-row">
          <button class="btn primary" type="button">${svg(icons.play)} Начать патруль</button>
          <button class="btn" type="button">${svg(icons.alert)} Открыть жалобы</button>
        </div>
      </section>

      <div class="cards-3">
        <article class="card kpi-card"><small>Точность</small><strong>94.2%</strong><span>+3.1% за неделю</span></article>
        <article class="card kpi-card"><small>Вердиктов</small><strong>124</strong><span>18 сегодня</span></article>
        <article class="card kpi-card"><small>Онлайн</small><strong>03:45</strong><span>смена активна</span></article>
      </div>

      <div class="cards-3">
        <article class="card rule-card">
          <div class="rule-icon">${svg(icons.check)}</div>
          <h3>Без нарушения</h3>
          <p>Обычный РП-диалог, вопрос по моду, торговля в разрешённых каналах.</p>
        </article>
        <article class="card rule-card">
          <div class="rule-icon">${svg(icons.alert)}</div>
          <h3>Мут</h3>
          <p>Флуд, капс, MG, оскорбления в OOC и провокации в чате.</p>
        </article>
        <article class="card rule-card">
          <div class="rule-icon">${svg(icons.ban)}</div>
          <h3>Блокировка</h3>
          <p>Реклама проектов, читы, продажа виртов, слив служебной информации.</p>
        </article>
      </div>
    </div>
  `,

  timed: () => `
    <div class="section-grid">
      <section class="card padded">
        <p class="eyebrow">Режим реакции</p>
        <h2>10 кейсов за 5 минут</h2>
        <p>Формат для телефона: крупные варианты ответа, короткие описания и мгновенный разбор после каждого решения.</p>
        <div class="action-row">
          <button class="btn primary" type="button">${svg(icons.clock)} Запустить таймер</button>
          <button class="btn" type="button">Тренировка без штрафов</button>
        </div>
      </section>
      <div class="cards-3">
        <article class="card kpi-card"><small>Рекорд</small><strong>04:12</strong><span>10/10 верно</span></article>
        <article class="card kpi-card"><small>Среднее</small><strong>87%</strong><span>точность режима</span></article>
        <article class="card kpi-card"><small>Серия</small><strong>6</strong><span>дней подряд</span></article>
      </div>
    </div>
  `,

  complaints: () => `
    <div class="section-grid">
      <div class="cards-3">
        <article class="card kpi-card"><small>Новые</small><strong>18</strong><span>5 срочных</span></article>
        <article class="card kpi-card"><small>На проверке</small><strong>7</strong><span>есть док-ва</span></article>
        <article class="card kpi-card"><small>Закрыто</small><strong>42</strong><span>за сутки</span></article>
      </div>
      <section class="card table-card">
        <div class="table-head"><span>ID</span><span>Жалоба</span><span>Статус</span></div>
        ${complaints.map((item) => `
          <div class="table-row">
            <span>#${item.id}</span>
            <div><b>${item.player}</b><small>${item.reason}</small></div>
            <span class="tag ${item.type}">${item.status}</span>
          </div>
        `).join('')}
      </section>
    </div>
  `,

  shop: () => `
    <div class="section-grid">
      <section class="card padded">
        <p class="eyebrow">Магазин смены</p>
        <h2>Награды за активность</h2>
        <p>Раздел оформлен как витрина: всё крупно, карточки читаются с телефона, кнопки нажимаются одним большим пальцем.</p>
      </section>
      <div class="cards-3">
        ${shopItems.map((item) => `
          <article class="card padded">
            <p class="eyebrow">${item.price}</p>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <div class="action-row"><button class="btn" type="button">Получить</button></div>
          </article>
        `).join('')}
      </div>
    </div>
  `,

  reports: () => `
    <div class="section-grid">
      <div class="cards-4">
        <article class="card kpi-card"><small>Муты</small><strong>36</strong><span>за неделю</span></article>
        <article class="card kpi-card"><small>Баны</small><strong>11</strong><span>2 спорных</span></article>
        <article class="card kpi-card"><small>Жалобы</small><strong>102</strong><span>91 закрыта</span></article>
        <article class="card kpi-card"><small>Ошибки</small><strong>3</strong><span>нужно разобрать</span></article>
      </div>
      <section class="card padded">
        <p class="eyebrow">Отчёт смены</p>
        <h2>Сводка готова к отправке</h2>
        <p>Система собирает действия за смену: наказания, спорные кейсы, время реакции и комментарии старших.</p>
        <div class="action-row">
          <button class="btn primary" type="button">${svg(icons.file)} Сформировать отчёт</button>
          <button class="btn" type="button">Скачать CSV</button>
        </div>
      </section>
    </div>
  `,

  management: () => `
    <div class="section-grid">
      <section class="card padded">
        <p class="eyebrow">Руководство</p>
        <h2>Команда и роли</h2>
        <p>Быстрый обзор смены, доступов и задач. На телефоне управление не разваливается в таблицу, а остаётся компактным списком.</p>
      </section>
      <div class="cards-2">
        <article class="card padded">
          <h3>Сейчас на линии</h3>
          <div class="quick-list" style="margin-top: 16px;">
            ${team.map((item) => `<div class="quick-item"><div><b>${item.name}</b><br><span>${item.role}</span></div><span class="tag green">online</span></div>`).join('')}
          </div>
        </article>
        <article class="card padded">
          <h3>Задачи старших</h3>
          <div class="quick-list" style="margin-top: 16px;">
            <div class="quick-item"><div><b>Проверить спорные баны</b><br><span>3 кейса ждут решения</span></div><span class="tag yellow">важно</span></div>
            <div class="quick-item"><div><b>Обновить правила чата</b><br><span>черновик готов</span></div><span class="tag">черновик</span></div>
            <div class="quick-item"><div><b>Назначить смену</b><br><span>вечерний слот пустой</span></div><span class="tag red">нет людей</span></div>
          </div>
        </article>
      </div>
    </div>
  `,

  default: () => `
    <section class="card padded">
      <p class="eyebrow">Раздел</p>
      <h2>В разработке</h2>
      <p>Этот экран подготовлен под мобильный интерфейс и будет наполнен логикой позже.</p>
    </section>
  `
};

const complaints = [
  { id: '21044', player: 'Andrey_Sokolov [342]', reason: 'DM в зелёной зоне у мэрии, приложено 2 скриншота.', status: 'ожидает', type: 'yellow' },
  { id: '21045', player: 'Maks_Korotkov [118]', reason: 'Оскорбления в OOC-чате после проигранной ситуации.', status: 'проверка', type: '' },
  { id: '21046', player: 'Ivan_Belov [77]', reason: 'Подозрение на рекламу стороннего проекта.', status: 'срочно', type: 'red' },
  { id: '21047', player: 'Nikita_Volk [909]', reason: 'Флуд командами и капс в общем чате.', status: 'готово', type: 'green' }
];

const shopItems = [
  { price: '120 XP', title: 'Скин профиля', text: 'Не влияет на полномочия, просто подчёркивает активность модератора.' },
  { price: '250 XP', title: 'Буст отчёта', text: 'Подсветка лучших смен в недельной сводке руководства.' },
  { price: '400 XP', title: 'Значок патруля', text: 'Награда за серию смен без ошибок и отменённых наказаний.' }
];

const team = [
  { name: 'Daniil_K', role: 'Старший модератор' },
  { name: 'John_Wick', role: 'Модератор' },
  { name: 'Mira_North', role: 'Младший модератор' }
];

document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (pages.some((page) => page.id === hash)) currentPage = hash;
  renderNavigation();
  loadPage(currentPage);

  window.addEventListener('hashchange', () => {
    const next = window.location.hash.replace('#', '');
    if (pages.some((page) => page.id === next)) loadPage(next);
  });
});
