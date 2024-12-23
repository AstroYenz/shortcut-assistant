import { sendEvent } from '@sx/analytics/event'
import {
  handleGetSavedNotes,
  handleOpenAICall
} from '@sx/service-worker/handlers'
import IpcRequest from '@sx/types/ipc-request'
import '@sx/auth/oauth/service-worker/listener'
import '@sx/ai/labels/listener'



function registerAiListeners(): void {
  chrome.runtime.onMessage.addListener((request: IpcRequest, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (request.action === 'callOpenAI') {
      if (!sender.tab || !sender.tab.id) {
        return
      }
      handleOpenAICall(request.data.prompt, request.data.type, sender.tab.id).then(sendResponse)
      return true // Keep the message channel open for the async response
    }
  })
}

function registerNotesListeners(): void {
  chrome.runtime.onMessage.addListener((request: IpcRequest, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (request.action === 'getSavedNotes') {
      handleGetSavedNotes().then(sendResponse)
      return true
    }
  })
}

function registerAnalyticsListeners(): void {
  chrome.runtime.onMessage.addListener((request: IpcRequest) => {
    if (request.action === 'sendEvent') {
      sendEvent(request.data.eventName, request.data.params).catch((e) => {
        console.error('Error sending event:', e)
      })
    }
  })
}

function registerListeners(): void {
  registerAiListeners()
  registerAnalyticsListeners()
  registerNotesListeners()
}

export { registerAiListeners, registerAnalyticsListeners, registerNotesListeners }

registerListeners()
