import { sendEvent } from '@sx/analytics/event'
import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'
import {
  handleGetSavedNotes,
  handleReactOpenAICall
} from '@sx/service-worker/handlers'
import IpcRequest from '@sx/types/ipc-request'
import '@sx/auth/oauth/service-worker/listener'
import '@sx/ai/labels/listener'

/**
 * CONSOLIDATED SERVICE WORKER LISTENERS
 * This consolidates the main AI, Notes, and Analytics listeners into one place
 * while keeping auth and labels as separate imports for now.
 */
chrome.runtime.onMessage.addListener((request: IpcRequest, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
  if (request.action === 'reactCallOpenAI') {
    if (!sender.tab?.id) return false
    handleReactOpenAICall(request.data.prompt, request.data.type as AiPromptType, request.data.requestId, sender.tab.id).then(sendResponse)
    return true
  }

  // Notes
  if (request.action === 'getSavedNotes') {
    handleGetSavedNotes().then(sendResponse)
    return true
  }

  // Analytics
  if (request.action === 'sendEvent') {
    sendEvent(request.data.eventName, request.data.params).catch((e) => {
      console.error('Error sending event:', e)
    })
    return false
  }

  return false
})

// Legacy functions for backward compatibility
function registerAiListeners(): void {
  // Now handled by consolidated listener above
}

function registerAnalyticsListeners(): void {
  // Now handled by consolidated listener above
}

function registerNotesListeners(): void {
  // Now handled by consolidated listener above
}

export { registerAiListeners, registerAnalyticsListeners, registerNotesListeners }
