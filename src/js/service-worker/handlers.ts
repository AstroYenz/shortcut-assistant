import callOpenAi from '@sx/ai/call-openai'
import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'
import { getActiveTab } from '@sx/utils/get-active-tab'
import { Story } from '@sx/utils/story'


async function handleOpenAICall(prompt: string, type: AiPromptType, tabId: number): Promise<void | {
  error: Error
}> {
  try {
    await callOpenAi(prompt, type, tabId)
  }
  catch (e: unknown) {
    console.error('Error calling OpenAI:', e)
    chrome.tabs.sendMessage(tabId, { message: 'OpenAIResponseFailed' })
    return { error: e as Error }
  }
}

/**
 * React-specific OpenAI handler - completely separate from legacy DOM manipulation
 * Sends streaming results directly to React components via message passing
 * Uses proxy system exclusively for React components
 */
async function handleReactOpenAICall(prompt: string, type: AiPromptType, requestId: string, tabId: number): Promise<void | { error: Error }> {
  try {
    // Send start message
    chrome.tabs.sendMessage(tabId, {
      type: 'react-ai-stream',
      requestId,
      status: 'streaming',
      content: '',
      analysisType: type
    })

    const url = process.env.PROXY_OPENAI_URL
    if (!url) {
      throw new Error('PROXY_OPENAI_URL is not set')
    }

    // Prepare request payload for proxy
    const { getOrCreateClientId } = await import('@sx/analytics/client-id')
    const instanceId = await getOrCreateClientId()

    // Make streaming API call to proxy
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: prompt,
        instanceId: instanceId,
        promptType: type
      })
    })

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status} ${response.statusText}`)
    }

    // Handle streaming response from proxy
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let accumulatedContent = ''

    async function processStream(): Promise<void> {
      if (!reader) return

      const result = await reader.read()

      if (result.done) {
        chrome.tabs.sendMessage(tabId, {
          type: 'react-ai-stream',
          requestId,
          status: 'completed',
          content: accumulatedContent,
          analysisType: type
        })
        return
      }

      // Decode the chunk from proxy
      const content = decoder.decode(result.value)
      if (content) {
        accumulatedContent += content
        chrome.tabs.sendMessage(tabId, {
          type: 'react-ai-stream',
          requestId,
          status: 'streaming',
          content: accumulatedContent,
          analysisType: type
        })
      }

      // Process next chunk
      await processStream()
    }

    if (reader) {
      try {
        await processStream()
      }
      finally {
        reader.releaseLock()
      }
    }
  }
  catch (e: unknown) {
    console.error('Error in React OpenAI call:', e)

    // Send error message to React components
    chrome.tabs.sendMessage(tabId, {
      type: 'react-ai-stream',
      requestId,
      status: 'error',
      error: e instanceof Error ? e.message : 'Unknown error occurred',
      analysisType: type
    })

    return { error: e as Error }
  }
}

async function handleGetSavedNotes(): Promise<{ data: string | null }> {
  const value = await Story.notes()
  return { data: value }
}

export async function handleCommands(command: string): Promise<void> {
  const activeTab = await getActiveTab()
  if (!activeTab || !activeTab.id) {
    return
  }
  if (command === 'change-state') {
    await chrome.tabs.sendMessage(activeTab.id, { message: 'change-state' })
  }
  else if (command === 'change-iteration') {
    await chrome.tabs.sendMessage(activeTab.id, { message: 'change-iteration' })
  }
}

export { handleGetSavedNotes }
export { handleOpenAICall }
export { handleReactOpenAICall }
