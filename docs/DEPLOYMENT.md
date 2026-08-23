# Сборка, Pull Request и публикация

Изменения выполняются в ветке `codex/*` и передаются через Pull Request в `main`.

Перед Pull Request необходимо запустить автоматические тесты и сборку.

## Превью Pull Request

GitHub Actions создаёт отдельное превью для каждого открытого Pull Request:

```text
https://kiraobezjanka-sudo.github.io/catch-a-dog/pr-preview/pr-<номер>/
```

Превью обновляется при новых коммитах и удаляется после закрытия PR.

## Основная версия

После слияния ветка `main` публикуется в корень GitHub Pages:

https://kiraobezjanka-sudo.github.io/catch-a-dog/

Основная публикация сохраняет каталог `pr-preview`, поэтому открытые проверочные версии не удаляются.

GitHub Pages должен использовать источник `gh-pages / (root)`. В конфигурации и истории Git запрещено хранить секреты и временные данные авторизации.
