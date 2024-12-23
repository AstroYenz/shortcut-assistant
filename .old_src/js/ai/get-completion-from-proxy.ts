import { AiProcessMessage, AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'

import { getOrCreateClientId } from '../analytics/client-id'
import { OpenAIError } from '../utils/errors'


export function readStream(reader: ReadableStreamDefaultReader<Uint8Array>, type: string, tabId: number): void {
  reader.read().then(({ done, value }) => {
    if (done) {
      chrome.tabs.sendMessage(tabId, {
        status: AiProcessMessageType.completed,
        message: 'Stream completed',
        data: { content: '', type }
      } as AiProcessMessage)
      return
    }
    const content = new TextDecoder().decode(value)
    const data = { content, type }
    chrome.tabs.sendMessage(tabId, { status: AiProcessMessageType.updated, data } as AiProcessMessage)

    // Recursive call to continue reading
    readStream(reader, type, tabId)
  }).catch((error: Error) => {
    console.error('Stream reading failed:', error)
    chrome.tabs.sendMessage(tabId, {
      status: AiProcessMessageType.failed,
      message: error.message,
    } as AiProcessMessage)
  })
}

export default async function getCompletionFromProxy(description: string, type: string, tabId: number): Promise<void> {
  let response
  try {
    const url = process.env.PROXY_OPENAI_URL
    if (!url) {
      throw new OpenAIError('PROXY_OPENAI_URL is not set')
    }
    const instanceId = await getOrCreateClientId()
    response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        content: description,
        instanceId: instanceId,
        promptType: type,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  catch (e) {
    throw new OpenAIError(`Error getting completion from proxy: ${e as string}`)
  }

  if (!response.ok) {
    throw new OpenAIError(`Proxy response was not ok. Status: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new OpenAIError('No data returned from proxy')
  }

  readStream(reader, type, tabId)
}
