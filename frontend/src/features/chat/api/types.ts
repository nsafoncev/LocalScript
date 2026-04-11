export interface GenerateCodeRequest {
  readonly prompt: string
}

export interface GenerateCodeResponse {
  readonly code: string
}

export interface ChatApi {
  sendMessage(payload: GenerateCodeRequest): Promise<GenerateCodeResponse>
}
