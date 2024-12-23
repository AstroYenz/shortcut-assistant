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
