# LocalScript

LocalScript — локальная агентная система для генерации Lua-кода под MWS Octapi / LowCode-сценарии без обращения к внешним AI API. Проект запускается в собственном контуре, работает через Ollama и объединяет frontend, backend, RAG, память чатов и многошаговый агентный pipeline.

## Что умеет проект

- принимать запросы на русском и английском языке
- задавать уточняющие вопросы, если постановка неоднозначна
- генерировать Lua-код под platform-specific сценарии (`wf.vars`, `wf.initVariables`, LocalScript)
- поддерживать generic Lua function mode для обычных задач без workflow-контекста
- хранить историю диалога по `session_id`
- использовать локальную базу знаний и доменные правила через RAG
- валидировать результат перед возвратом пользователю
- запускаться локально через Docker Compose

## Архитектура

### Общая схема

`Frontend -> Nginx -> FastAPI Backend -> Agent Pipeline -> Ollama`

### Agent pipeline

Для session-aware чата используется маршрут:

`ChatMemory -> Clarifier -> RAG -> Refiner -> Coder -> Validator`

Для backward-compatible генерации через `/generate` используется упрощённый stateless pipeline:

`RAG -> Refiner -> Coder -> Validator`

### Роли агентов

- `ClarifierAgent` — определяет, хватает ли данных для генерации, и задаёт уточняющий вопрос
- `PromptRefinerAgent` — преобразует запрос в более точную техническую постановку
- `CoderAgent` — генерирует Lua-код
- `CriticAgent` — пробует исправить код, если валидатор нашёл ошибки
- `LuaGenerationValidator` — проверяет структуру ответа, формат `lua{...}lua`, запретные конструкции и базовую корректность

## ML stack

- `Ollama` — локальный inference runtime
- `qwen2.5-coder:7b` — тяжёлые шаги генерации и критики кода
- `qwen2.5:1.5b` — лёгкие шаги (`clarifier`, `refiner`)
- локальная knowledge base в `backend/knowledge/*.md`
- rule-based validation layer
- SQLite chat memory

## Важное ограничение по памяти

Текущий Docker-конфиг настроен на:

- `MODEL_NAME=qwen2.5-coder:7b`
- `FAST_MODEL_NAME=qwen2.5:1.5b`

Если `qwen2.5-coder:7b` не помещается в доступную память Docker/WSL, Ollama вернёт ошибку вида:

`model requires more system memory ... than is available`

В этом случае есть 2 варианта:

1. увеличить память Docker Desktop / WSL
2. временно откатить heavy-модель на `qwen2.5-coder:3b-instruct-q4_K_M`

## Структура проекта

```text
.
├─ backend/
│  ├─ agents/
│  │  ├─ prompts/
│  │  ├─ base.py
│  │  ├─ clarifier.py
│  │  ├─ refiner.py
│  │  ├─ coder.py
│  │  ├─ critic.py
│  │  └─ validator.py
│  ├─ knowledge/
│  ├─ chat_memory.py
│  ├─ chat_service.py
│  ├─ main.py
│  ├─ ollama_client.py
│  ├─ pipeline.py
│  └─ rag.py
├─ frontend/
│  ├─ src/
│  ├─ Dockerfile
│  └─ package.json
├─ nginx/
│  └─ default.conf
├─ ollama/
│  └─ entrypoint.sh
├─ tests/
├─ docker-compose.yaml
└─ README.md
```

## Быстрый запуск

### Однострочный запуск всего проекта

```powershell
docker compose up --build
```

После запуска открой:

- `http://localhost:8088`
- `http://localhost:8088/health`
- `http://localhost:8088/docs`

## Как работает Docker-контур

`docker-compose.yaml` поднимает 4 сервиса:

- `ollama` — локальный runtime моделей
- `backend` — FastAPI + agent orchestration
- `frontend` — React/Vite UI
- `nginx` — внешний reverse proxy на `localhost:8088`

### Маршрутизация

- `/chat` -> backend
- `/generate` -> backend
- `/health` -> backend
- `/docs` -> backend
- всё остальное -> frontend

## Локальный запуск без Docker

### 1. Установить модели

```powershell
ollama pull qwen2.5-coder:7b
ollama pull qwen2.5:1.5b
```

### 2. Запустить Ollama

```powershell
ollama serve
```

### 3. Запустить backend

Из корня проекта:

```powershell
venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 4. Запустить frontend

```powershell
cd frontend
npm ci
npm run dev
```

## Конфигурация моделей

Ролевая маршрутизация моделей задаётся через переменные окружения.

### Backend

- `MODEL_NAME` — дефолтная модель
- `CLARIFIER_MODEL` — модель для уточняющих вопросов
- `REFINER_MODEL` — модель для рефайнера
- `CODER_MODEL` — модель генерации кода
- `CRITIC_MODEL` — модель исправления кода

### Текущее значение в Docker

- `MODEL_NAME=qwen2.5-coder:7b`
- `CLARIFIER_MODEL=qwen2.5:1.5b`
- `REFINER_MODEL=qwen2.5:1.5b`
- `CODER_MODEL=qwen2.5-coder:7b`
- `CRITIC_MODEL=qwen2.5-coder:7b`

## API

### `POST /chat`

Session-aware endpoint для полноценного диалога.

Пример запроса:

```json
{
  "session_id": "demo-1",
  "message": "Как прибавить 1 к числовой переменной ws в LuaCode?",
  "context": "{\"wf\":{\"vars\":{\"ws\":3}}}"
}
```

Возможные статусы ответа:

- `needs_clarification`
- `completed`
- `invalid`

### `GET /chat/{session_id}/history`

Возвращает историю сообщений по сессии.

### `POST /generate`

Stateless endpoint для обратной совместимости.

Пример запроса:

```json
{
  "prompt": "Из полученного списка email получи последний"
}
```

### `GET /health`

Проверка доступности backend.

## Формат ответа кодогенератора

Основной backend-контракт для кодогенерации:

```json
{"result":"lua{...}lua"}
```

На фронте этот формат автоматически:

- распаковывается
- форматируется для отображения
- копируется в читаемом виде

## Generic Lua Function Mode

Если пользователь явно просит обычную Lua-функцию и не даёт workflow-контекст, система переключается в generic mode.

Пример запроса:

```text
Сделай функцию, которая получает на вход массив чисел, а выдает их сумму
```

Ожидаемое поведение:

- `clarifier` не спрашивает про `wf.vars`
- `coder` использует отдельный generic prompt
- результатом становится plain Lua function внутри `lua{...}lua`

## RAG и база знаний

Локальная база знаний хранится в:

- `backend/knowledge/lua_patterns.md`
- `backend/knowledge/octapi_rules.md`

RAG используется для:

- platform-specific правил
- безопасных Lua-паттернов
- правил работы с `wf.vars`, массивами, датами и типовыми LocalScript-задачами

## Память чатов

Память хранится в SQLite через `backend/chat_memory.py`.

Что хранится:

- `sessions`
- `messages`

Это даёт:

- продолжение уточняющего диалога
- историю ответов по `session_id`
- повторное использование контекста при следующих запросах

## Тесты

### Backend

```powershell
venv\Scripts\python -m unittest tests.test_clarifier tests.test_coder_fastpaths tests.test_chat_service_flow tests.test_pipeline tests.test_validator tests.test_model_selection -v
```

### Публичная выборка

```powershell
venv\Scripts\python tests\test_agent.py
```

### Frontend

```powershell
cd frontend
npm ci
npm test
```

## Полезные файлы

- [backend/main.py](backend/main.py)
- [backend/chat_service.py](backend/chat_service.py)
- [backend/pipeline.py](backend/pipeline.py)
- [backend/ollama_client.py](backend/ollama_client.py)
- [docker-compose.yaml](docker-compose.yaml)
- [ollama/entrypoint.sh](ollama/entrypoint.sh)
- [nginx/default.conf](nginx/default.conf)

## Известные особенности

- `qwen2.5-coder:7b` может не стартовать при маленьком лимите памяти Docker/WSL
- часть platform-specific кейсов решается через deterministic fast-path / fallback слой для стабильности
- generic function mode и LocalScript mode — это разные режимы работы пайплайна
- frontend-тесты на Windows могут упираться в особенности `vitest` worker pool; в таком случае помогает повторный запуск после очистки окружения

## Безопасность и локальность

Проект не использует внешние AI API в runtime.

Генерация выполняется:

- локально
- через Ollama
- на собственной инфраструктуре
- без отправки пользовательских данных во внешние LLM-сервисы

## Что ещё можно улучшить

- добавить явный token budget manager
- добавить метрики времени по этапам `clarifier/refiner/coder/critic`
- усилить generic function mode для большего числа алгоритмических задач
- расширить knowledge base и rule-based validation
