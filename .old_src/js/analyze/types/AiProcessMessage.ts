import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'
import { IpcRequestBase } from '@sx/types/ipc-request'


export enum AiProcessMessageType {
  completed = 2,
  failed = 1,
  updated = 0,
}


export interface AiProcessMessage extends IpcRequestBase {
  status: AiProcessMessageType
  message?: string
  data?: { content: string, type: AiPromptType }
}
