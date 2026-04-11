#!/bin/sh
set -e

# Запускаем ollama сервер в фоне
ollama serve &
OLLAMA_PID=$!

# Ждём пока сервер поднимется
echo "Waiting for Ollama to start..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done

# Скачиваем модель если её ещё нет
echo "Pulling model..."
ollama pull qwen2.5-coder:3b-instruct-q4_K_M

echo "Ollama ready."

# Держим контейнер живым
wait $OLLAMA_PID