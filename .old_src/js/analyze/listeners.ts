import { AiProcessMessage, AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'

import { AiFunctions } from './ai-functions'


chrome.runtime.onMessage.addListener(handleMessages)

export default async function handleMessages(message: AiProcessMessage | Record<string, unknown>): Promise<void> {
  const functions = new AiFunctions()
  if (message.status === undefined) {
    return
  }
  if (message.status === AiProcessMessageType.updated || message.status === AiProcessMessageType.completed || message.status === AiProcessMessageType.failed) {
    await functions.processOpenAIResponse(<AiProcessMessage>message)
  }
}
