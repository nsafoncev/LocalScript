import type { MessageFormat } from '../../../shared/lib/message-format'

export interface GenerateCodeRequest {
  readonly prompt: string
}

export interface GenerateCodeResponse {
  readonly code?: string
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
