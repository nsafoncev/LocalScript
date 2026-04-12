import {
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
} from 'react'
import styles from './ChatInput.module.scss'

const MIN_TEXTAREA_HEIGHT = 56
const MAX_TEXTAREA_HEIGHT = 180

type ChatInputProps = {
  isPending: boolean
  onSend: (value: string) => Promise<void>
  onStopGenerating: () => void
}

function resizeTextareaElement(element: HTMLTextAreaElement): void {
  element.style.height = '0px'

  const nextHeight = Math.min(
    Math.max(element.scrollHeight, MIN_TEXTAREA_HEIGHT),
    MAX_TEXTAREA_HEIGHT,
  )

  element.style.height = `${nextHeight}px`
  element.style.overflowY =
    element.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden'
}

export function ChatInput({
  isPending,
  onSend,
  onStopGenerating,
}: ChatInputProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [value, setValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  const trimmedValue = value.trim()
  const isSubmitDisabled = !trimmedValue || isPending || isSending

  function resetTextarea(): void {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = `${MIN_TEXTAREA_HEIGHT}px`
    textarea.style.overflowY = 'hidden'
  }

  async function handleSubmit(): Promise<void> {
    if (isSubmitDisabled) {
      return
    }

    setIsSending(true)

    try {
      await onSend(trimmedValue)
      setValue('')

      globalThis.requestAnimationFrame(() => {
        resetTextarea()
      })
    } finally {
      setIsSending(false)
    }
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    setValue(event.target.value)
    resizeTextareaElement(event.target)
  }

  async function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): Promise<void> {
    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()
    await handleSubmit()
  }

  return (
    <div className={styles.composer}>
      <div className={styles.inputShell}>
        <textarea
          ref={textareaRef}
          aria-label="Поле ввода сообщения"
          className={styles.input}
          disabled={isPending || isSending}
          placeholder="Введите запрос или сообщение..."
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={(event) => {
            void handleKeyDown(event)
          }}
        />
      </div>

      {isPending ? (
        <button
          aria-label="Остановить генерацию"
          className={styles.stopButton}
          type="button"
          onClick={onStopGenerating}
        >
          Стоп
        </button>
      ) : (
        <button
          aria-busy={isSending}
          aria-label="Отправить сообщение"
          className={`${styles.sendButton} ${isSending ? styles.loading : ''}`}
          disabled={isSubmitDisabled}
          type="button"
          onClick={() => {
            void handleSubmit()
          }}
        >
          <span className={styles.iconLayer} aria-hidden={isSending}>
            <img
              alt=""
              className={styles.sendIcon}
              height="18"
              src="/arrow-up-icon.svg"
              width="18"
            />
          </span>
          <span className={styles.loaderLayer} aria-hidden={!isSending}>
            <span className={styles.loader} />
          </span>
        </button>
      )}
    </div>
  )
}
