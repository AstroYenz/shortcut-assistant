import { AiProcessMessage, AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'

import { AiFunctions } from './ai-functions'

// NOTE: Message listener moved to unified router in content-bridge.ts
// This function is now called by the unified router instead of directly by chrome.runtime.onMessage
export default async function handleMessages(message: AiProcessMessage | Record<string, unknown>): Promise<void> {
  const functions = new AiFunctions()
  if (message.status === undefined) {
    return
  }
  if (message.status === AiProcessMessageType.updated || message.status === AiProcessMessageType.completed || message.status === AiProcessMessageType.failed) {
    await functions.processOpenAIResponse(<AiProcessMessage>message)
  }
}
