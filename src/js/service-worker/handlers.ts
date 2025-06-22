import callOpenAi from '@sx/ai/call-openai'
import getOpenAiToken from '@sx/ai/get-openai-token'
import PROMPT from '@sx/ai/prompt'
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
 * Duplicates AI functionality without interfering with legacy system
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

    // Get OpenAI token
    const token = await getOpenAiToken()
    if (!token) {
      throw new Error('OpenAI token not found')
    }

    // Prepare prompts (duplicate from fetchCompletion logic)
    const BREAKUP_PROMPT = 'You are a Senior Engineering Manager who is assisting team members with taking'
      + ' a large user story and breaking it up into smaller  more approachable (from an engineering work'
      + ' perspective) stories and subtasks. '
      + ''
      + 'Only respond with new stories, structured/formatted like the one the user gave you.'
      + ' Do not be verbose. Do not include story titles. Separate all stories you create with `---`.'

    const promptTypes: Record<AiPromptType, string> = {
      breakup: BREAKUP_PROMPT,
      analyze: PROMPT
    }

    // Make API call to OpenAI (simplified version for React)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: promptTypes[type] },
          { role: 'user', content: prompt }
        ],
        stream: false // Get complete response for React
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Send completion message
    chrome.tabs.sendMessage(tabId, {
      type: 'react-ai-stream',
      requestId,
      status: 'completed',
      content,
      analysisType: type
    })
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
