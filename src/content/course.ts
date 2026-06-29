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
  },
  {
    title: "Кандидаты и апелляции",
    slug: "candidates-appeals",
    description: "Проверка заявок, собеседования, перенос в кандидаты и разбор жалоб.",
    status: "available",
    progress: 0,
    lessons: [
      {
        title: "Проверка заявки кандидата",
        slug: "candidate-application",
        duration: "18 мин",
        status: "not_started",
        summary: "Как принять заявку без ручного хаоса и не пропустить слабые места.",
        content: [
          "Заявка проверяется по базовым полям: ник, возраст, VK, форумный аккаунт, Discord и связность ответов.",
          "Если ссылка не открывается, возраст не подходит или ответы выглядят шаблонно, заявку нельзя принимать автоматически.",
          "Корректное решение по заявке должно содержать вердикт, причину и следующее действие: принять, отказать или отправить на уточнение."
        ],
        challenge: {
          title: "Кейс: неполная заявка",
          instructions: [
            "Проверь, можно ли принять кандидата.",
            "Укажи недостающие данные.",
            "Напиши короткий вердикт для staff-чата."
          ],
          seedCode:
            "Ситуация: кандидат указал ник и Discord, но не приложил форумный аккаунт и оставил VK закрытым.\n\nВердикт: ",
          tests: [
            {
              id: "has-missing",
              message: "Укажи, что данных недостаточно.",
              type: "regex",
              value: "недостат|непол|нет|закрыт"
            },
            {
              id: "has-forum",
              message: "Отметь форумный аккаунт.",
              type: "regex",
              value: "форум|фа|аккаунт"
            },
            {
              id: "no-accept",
              message: "Не принимай заявку без проверки.",
              type: "notIncludes",
              value: "принять"
            }
          ]
        }
      },
      {
        title: "Апелляция на наказание",
        slug: "punishment-appeal",
        duration: "20 мин",
        status: "not_started",
        summary: "Как пересмотреть мут или бан без спора с пользователем.",
        content: [
          "Апелляция рассматривается по материалам: кто выдал наказание, за что, какие доказательства были у модератора.",
          "Если доказательства наказания слабые, решение можно смягчить или снять, но нужно зафиксировать причину.",
          "Если наказание корректное, ответ должен быть спокойным: факт нарушения, пункт правил и срок."
        ],
        challenge: {
          title: "Кейс: спорный мут",
          instructions: [
            "Проверь, достаточно ли доказательств.",
            "Выбери: оставить, смягчить или снять.",
            "Добавь причину решения."
          ],
          seedCode:
            "Ситуация: пользователь оспаривает мут. В журнале есть причина, но нет скриншота сообщения.\n\nРешение: ",
          tests: [
            {
              id: "has-proof",
              message: "Отметь проблему с доказательствами.",
              type: "regex",
              value: "доказ|скрин|материал"
            },
            {
              id: "has-decision",
              message: "Выбери действие по наказанию.",
              type: "regex",
              value: "снять|смягч|остав"
            },
            {
              id: "has-reason",
              message: "Добавь причину решения.",
              type: "regex",
              value: "причин|так как|потому"
            }
          ]
        }
      }
    ],
    assignments: [
      {
        title: "Проверить 5 заявок кандидатов",
        slug: "candidate-batch-review",
        status: "not_started",
        summary: "Разделить заявки на принятие, отказ и уточнение.",
        criteria: [
          "По каждой заявке есть вердикт.",
          "Отказы и уточнения содержат понятную причину.",
          "Принятые кандидаты имеют все обязательные ссылки."
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
  return courseModules.find((courseModule) => courseModule.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const courseModule = getModule(moduleSlug);
  const lesson = courseModule?.lessons.find((item) => item.slug === lessonSlug);

  return { module: courseModule, lesson };
}

export function getAssignment(slug: string) {
  for (const courseModule of courseModules) {
    const assignment = courseModule.assignments.find((item) => item.slug === slug);

    if (assignment) {
      return { module: courseModule, assignment };
    }
  }

  return { module: undefined, assignment: undefined };
}

export function getNextLesson() {
  return courseModules
    .flatMap((courseModule) =>
      courseModule.lessons.map((lesson) => ({
        module: courseModule,
        lesson
      }))
    )
    .find(({ lesson }) => lesson.status !== "completed");
}
