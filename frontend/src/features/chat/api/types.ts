import type { MessageFormat } from '../../../shared/lib/message-format'

export interface GenerateCodeRequest {
  readonly sessionId: string
  readonly message: string
  readonly context?: string
}

export interface GenerateCodeResponse {
  readonly status?: 'needs_clarification' | 'completed' | 'invalid'
  readonly code?: string
  readonly refined_prompt?: string
  readonly validation_errors?: string[]
  readonly text?: string
  readonly message?: string
  readonly content?: string
  readonly format?: MessageFormat
  readonly type?: MessageFormat
}

export interface ChatRequestOptions {
  readonly signal?: AbortSignal
}

export interface ChatApi {
  sendMessage(
    payload: GenerateCodeRequest,
    options?: ChatRequestOptions,
  ): Promise<GenerateCodeResponse>
}
