#!/bin/sh

set -eu

READY_FILE="/tmp/ollama-ready"
PRIMARY_MODEL="${MODEL_NAME:-qwen2.5-coder:7b}"

rm -f "$READY_FILE"

pull_model() {
  model_name="$1"
  label="$2"
  i=1

  echo "Pulling $label model: $model_name"
  while [ "$i" -le 5 ]; do
    if ollama pull "$model_name"; then
      return 0
    fi

    echo "$label model pull failed (attempt $i/5), retrying in 5s..."
    i=$((i + 1))
    sleep 5
  done

  echo "Failed to pull $label model after 5 attempts: $model_name"
  return 1
}

ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama to start..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done

pull_model "$PRIMARY_MODEL" "primary"

if [ -n "${FAST_MODEL_NAME:-}" ] && [ "$FAST_MODEL_NAME" != "$PRIMARY_MODEL" ]; then
  pull_model "$FAST_MODEL_NAME" "fast"
fi

touch "$READY_FILE"
echo "Ollama ready."
wait $OLLAMA_PID
