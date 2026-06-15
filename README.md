# Cherepovets 89 v15 clean working no organizations

Сборка сделана из полного `index.html`, без выноса основного JS в отдельный файл, чтобы не потерять inline-обработчики кнопок входа, регистрации и навигации.

Что изменено:
- удалена верхняя категория `Организации`;
- удалена под-навигация `subNavOrganizations`;
- удалены статические разделы ФСБ/организаций из основного интерфейса;
- удалены блоки, которые прятали `Поддержку` и отключали анимации;
- основной код авторизации оставлен в исходной inline-структуре.

Проверка сборки:
- ch89-entry-auth-script: OK
- button data-cat="support": OK
- button data-cat="organizations": REMOVED
- FINAL SAFE / LEGACY restore blocks: REMOVED
