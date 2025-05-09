type Message = {
  action: string
  data: Record<string, unknown>
}

type MessageResponse = {
  success: boolean
  data: Record<string, unknown>
}

export type { Message, MessageResponse }
