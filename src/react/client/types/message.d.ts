type Message<T extends Record<string, unknown>> = {
  action: string
  data: T
}

type MessageResponse<T extends Record<string, unknown>> = {
  success: boolean
  data: T
}

export type { Message, MessageResponse }
