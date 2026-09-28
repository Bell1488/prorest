# Запуск

1. Скопируйте `.env.example` в `.env` и задайте `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` и `SOCKS5H_PROXY`.
2. Установите зависимости: `npm ci`.
3. Соберите фронтенд: `npm run build`.
4. Запустите API и раздачу `dist`: `node --env-file=.env server.mjs` (Node.js 20.6+) либо задайте переменные окружения через systemd/Docker и выполните `npm start`.

Бот должен быть добавлен в группу и иметь право отправлять сообщения. Для SOCKS5 используйте именно схему `socks5h://`: DNS-имя `api.telegram.org` тогда разрешается через прокси. В dev-режиме запустите API на `8787` и отдельно `npm run dev`; Vite проксирует `/api` на API.

Для Метрики укажите публичный идентификатор счетчика в `VITE_YANDEX_METRIKA_ID` до сборки. Секреты Telegram и SOCKS5 никогда не передаются во фронтенд.
