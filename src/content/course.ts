import type { CourseModule, Submission } from "@/lib/types";

export const courseModules: CourseModule[] = [
  {
    title: "База модератора",
    slug: "moderation-basics",
    description: "Роли, доказательства, нейтральность и первый разбор ситуации.",
    status: "completed",
    progress: 100,
    lessons: [
      {
        title: "Роль модератора Discord",
        slug: "moderator-role",
        duration: "12 мин",
        status: "completed",
        summary: "Что модератор делает в чате и где нельзя действовать на эмоциях.",
        content: [
          "Модератор поддерживает порядок в Discord-сервере, помогает игрокам и фиксирует нарушения по доказательствам.",
          "Главное правило: сначала факт и пункт правил, потом мера. Личные симпатии, провокации и спешка не должны влиять на решение.",
          "Если пункта правил не хватает или ситуация спорная, решение передаётся старшему составу."
        ],
        challenge: {
          title: "Кейс: спор в общем чате",
          instructions: [
            "Определи, есть ли нарушение.",
            "Укажи, какие доказательства нужны перед наказанием.",
            "Напиши короткое действие модератора."
          ],
          seedCode:
            "Ситуация: два игрока спорят в общем канале. Один пишет провокационные фразы без прямых оскорблений.\n\nРешение: ",
          tests: [
            {
              id: "has-evidence",
              message: "Укажи, что нужны доказательства/контекст.",
              type: "regex",
              value: "доказ|контекст|скрин|сообщ"
            },
            {
              id: "has-warning",
              message: "Добавь мягкое действие: предупреждение или устное замечание.",
              type: "regex",
              value: "устн|предупреж|замеч"
            },
            {
              id: "no-ban",
              message: "Не ставь бан без явного грубого нарушения.",
              type: "notIncludes",
              value: "бан"
            }
          ]
        }
      },
      {
        title: "Доказательства и фиксация",
        slug: "evidence",
        duration: "20 мин",
        status: "completed",
        summary: "Как оформить решение так, чтобы его можно было проверить.",
        content: [
          "Доказательства должны показывать сам факт нарушения: сообщение, автора, время и контекст.",
          "Если доказательство обрезано или непонятно, наказание лучше не выдавать до уточнения.",
          "В отчёте важно писать не эмоцию, а связку: факт → пункт → действие."
        ],
        challenge: {
          title: "Кейс: неполный скриншот",
          instructions: [
            "Оцени качество доказательства.",
            "Напиши, что нужно запросить дополнительно.",
            "Не выдавай наказание по неполному материалу."
          ],
          seedCode:
            "Ситуация: жалоба содержит один обрезанный скрин без ника нарушителя и времени.\n\nРешение: ",
          tests: [
            {
              id: "has-incomplete",
              message: "Отметь, что доказательство неполное.",
              type: "regex",
              value: "неполн|недостат|обрез"
            },
            {
              id: "has-request",
              message: "Запроси полный скрин/ссылку/контекст.",
              type: "regex",
              value: "запрос|полный|ссыл|контекст"
            },
            {
              id: "no-punish",
              message: "Не выдавай наказание сразу.",
              type: "notIncludes",
              value: "выдать бан"
            }
          ]
        }
      }
    ],
    assignments: [
      {
        title: "Разобрать 3 спорных ситуации",
        slug: "review-three-cases",
        status: "approved",
        summary: "Написать факт, пункт правил и действие по каждому кейсу.",
        criteria: [
          "Есть краткое описание факта.",
          "Указан пункт правил или причина эскалации.",
          "Действие не жёстче нарушения."
        ]
      }
    ]
  },
  {
    title: "Наказания и правила",
    slug: "punishments",
    description: "Учимся выбирать меру без лишней жёсткости и без пропущенных нарушений.",
    status: "in_progress",
    progress: 42,
    lessons: [
      {
        title: "Оскорбления и провокации",
        slug: "insults-provocations",
        duration: "18 мин",
        status: "completed",
        summary: "Как отличать конфликт, провокацию и прямое нарушение.",
        content: [
          "Прямое оскорбление, травля, угрозы и дискриминация требуют реакции быстрее, чем обычный спор.",
          "Провокация оценивается по контексту: иногда достаточно устного предупреждения, иногда нужен мут.",
          "Если нарушение затрагивает родных, угрозы или запрещённые темы, решение лучше фиксировать особенно аккуратно."
        ],
        challenge: {
          title: "Кейс: прямое оскорбление",
          instructions: [
            "Назови нарушение.",
            "Выбери мягкую, но достаточную меру.",
            "Добавь короткий комментарий для журнала."
          ],
          seedCode:
            "Ситуация: игрок в общем чате прямо оскорбил другого игрока и продолжил конфликт после замечания.\n\nРешение: ",
          tests: [
            {
              id: "has-insult",
              message: "Укажи оскорбление/конфликт.",
              type: "regex",
              value: "оскорб|конфликт"
            },
            {
              id: "has-mute",
              message: "Выбери мут как основную меру.",
              type: "regex",
              value: "мут"
            },
            {
              id: "has-reason",
              message: "Добавь причину для журнала.",
              type: "regex",
              value: "причин|журнал|за "
            }
          ]
        }
      },
      {
        title: "Реклама и сторонние ссылки",
        slug: "ads-links",
        duration: "22 мин",
        status: "in_progress",
        summary: "Когда нужна блокировка, а когда достаточно удалить сообщение.",
        content: [
          "Реклама сторонних проектов, продажа услуг и подозрительные ссылки требуют быстрой реакции.",
          "Перед наказанием нужно зафиксировать сообщение и проверить, что это действительно реклама, а не разрешённый ресурс.",
          "Сообщение с рекламой удаляется, а мера зависит от тяжести и повторности."
        ],
        challenge: {
          title: "Кейс: ссылка на сторонний проект",
          instructions: [
            "Укажи, что сообщение нужно удалить.",
            "Выбери наказание.",
            "Не забудь про доказательство."
          ],
          seedCode:
            "Ситуация: новый участник отправил ссылку на другой игровой проект и зовёт туда игроков.\n\nРешение: ",
          tests: [
            {
              id: "has-ad",
              message: "Укажи рекламу/сторонний проект.",
              type: "regex",
              value: "реклам|сторон"
            },
            {
              id: "has-delete",
              message: "Укажи удаление сообщения.",
              type: "regex",
              value: "удал"
            },
            {
              id: "has-ban-or-mute",
              message: "Выбери бан или мут по тяжести.",
              type: "regex",
              value: "бан|мут"
            }
          ]
        }
      }
    ],
    assignments: [
      {
        title: "Подготовить журнал наказаний",
        slug: "punishment-log",
        status: "submitted",
        summary: "Оформить 5 решений в формате факт → правило → мера.",
        criteria: [
          "У каждого решения есть доказательство.",
          "Мера соответствует тяжести нарушения.",
          "Спорные решения отмечены для старшего состава."
        ]
      }
    ]
  },
  {
    title: "Отчёты и повышение",
    slug: "reports-growth",
    description: "Сдача отчётов, исправления, собеседования и движение по составу.",
    status: "available",
    progress: 0,
    lessons: [
      {
        title: "Сдача отчёта",
        slug: "report-submit",
        duration: "16 мин",
        status: "not_started",
        summary: "Как написать отчёт так, чтобы его быстро приняли.",
        content: [
          "Хороший отчёт короткий: что сделано, дата, тип сдачи и доказательства.",
          "Если доказательство не открывается или не относится к работе, отчёт возвращается на исправление.",
          "Для повышения важны регулярность, аккуратность решений и отсутствие спорных наказаний."
        ],
        challenge: {
          title: "Кейс: отчёт без доказательств",
          instructions: [
            "Проверь, можно ли принять отчёт.",
            "Укажи, что нужно исправить.",
            "Напиши корректный ответ модератору."
          ],
          seedCode:
            "Ситуация: модератор написал работу и дату, но не приложил ссылку/скрин доказательства.\n\nОтвет: ",
          tests: [
            {
              id: "has-fix",
              message: "Отправь отчёт на исправление.",
              type: "regex",
              value: "исправ|доработ"
            },
            {
              id: "has-proof",
              message: "Попроси доказательство.",
              type: "regex",
              value: "доказ|ссыл|скрин"
            },
            {
              id: "no-accept",
              message: "Не принимай отчёт без доказательств.",
              type: "notIncludes",
              value: "принять"
            }
          ]
        }
      }
    ],
    assignments: [
      {
        title: "Проверить отчёты недели",
        slug: "weekly-report-review",
        status: "not_started",
        summary: "Разделить отчёты на принятые, исправления и спорные.",
        criteria: [
          "Принятые отчёты имеют доказательства.",
          "Исправления содержат понятную причину.",
          "Спорные отчёты отправлены старшему составу."
        ]
      }
    ]
  }
];

export const submissions: Submission[] = [
  {
    assignmentTitle: "Разобрать 3 спорных ситуации",
    assignmentSlug: "review-three-cases",
    moduleTitle: "База модератора",
    status: "approved",
    githubUrl: "https://vk.com/cherepovets89",
    deployUrl: "https://docs.google.com/spreadsheets/",
    updatedAt: "Сегодня",
    check: {
      status: "approved",
      summary: "Проверка пройдена: решения оформлены аккуратно.",
      results: [
        {
          id: "case-format",
          label: "Формат решений",
          passed: true,
          message: "Есть факт, пункт и действие."
        }
      ]
    }
  },
  {
    assignmentTitle: "Подготовить журнал наказаний",
    assignmentSlug: "punishment-log",
    moduleTitle: "Наказания и правила",
    status: "changes_requested",
    githubUrl: "https://vk.com/cherepovets89",
    deployUrl: "https://docs.google.com/spreadsheets/",
    updatedAt: "Вчера",
    check: {
      status: "changes_requested",
      summary: "Нужно уточнить доказательства в двух решениях.",
      results: [
        {
          id: "proofs",
          label: "Доказательства",
          passed: false,
          message: "В двух строках нет ссылки на доказательство."
        },
        {
          id: "measure",
          label: "Мера наказания",
          passed: true,
          message: "Меры соответствуют тяжести кейсов."
        }
      ]
    }
  }
];

export function getModule(slug: string) {
  return courseModules.find((module) => module.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const module = getModule(moduleSlug);
  const lesson = module?.lessons.find((item) => item.slug === lessonSlug);

  return { module, lesson };
}

export function getAssignment(slug: string) {
  for (const module of courseModules) {
    const assignment = module.assignments.find((item) => item.slug === slug);

    if (assignment) {
      return { module, assignment };
    }
  }

  return { module: undefined, assignment: undefined };
}

export function getNextLesson() {
  return courseModules
    .flatMap((module) =>
      module.lessons.map((lesson) => ({
        module,
        lesson
      }))
    )
    .find(({ lesson }) => lesson.status !== "completed");
}
