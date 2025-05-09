import registerUser from '@sx/auth/oauth/service-worker/registration'
import IpcRequest from '@sx/types/ipc-request'

import { handleInitiateGoogleOAuth, handleProcessShortcutApiToken } from '@/service-worker/auth/listeners'


chrome.runtime.onMessage.addListener((request: IpcRequest, sender, sendResponse) => {
  if (request.action === 'saveUserToken') {
    registerUser(request.data.googleToken, request.data.shortcutToken)
  }

  // Handle the processShortcutApiToken action from content script
  if (request.action === 'processShortcutApiToken') {
    handleProcessShortcutApiToken(request.data.shortcutToken, sendResponse)
    return true // Keep message channel open for async response
  }

  // Handle the initiateGoogleOAuth action from content script
  if (request.action === 'initiateGoogleOAuth') {
    handleInitiateGoogleOAuth(sendResponse)
    return true // Keep message channel open for async response
  }
})
