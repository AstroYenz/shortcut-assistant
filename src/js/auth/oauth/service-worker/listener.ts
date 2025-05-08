import registerUser from '@sx/auth/oauth/service-worker/registration'
import IpcRequest from '@sx/types/ipc-request'


chrome.runtime.onMessage.addListener((request: IpcRequest, sender, sendResponse) => {
  if (request.action === 'saveUserToken') {
    registerUser(request.data.googleToken, request.data.shortcutToken)
  }

  // Handle the processShortcutApiToken action from content script
  if (request.action === 'processShortcutApiToken') {
    handleProcessShortcutApiToken(request.data.shortcutToken, sendResponse)
    return true // Keep message channel open for async response
  }
})

/**
 * Process the Shortcut API token by getting the Google auth token
 * and then registering the user with both tokens
 */
function handleProcessShortcutApiToken(shortcutToken: string, sendResponse: (response?: any) => void): void {
  try {
    chrome.identity.getAuthToken({ interactive: true }, (googleToken) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message
        })
        return
      }

      if (!googleToken) {
        sendResponse({
          success: false,
          error: 'No token received'
        })
        return
      }

      // Register the user with both tokens
      registerUser(googleToken, shortcutToken)
        .then(() => {
          sendResponse({
            success: true,
            message: 'Token submitted successfully'
          })
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error: error.message || 'Failed to register user'
          })
        })
    })
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    sendResponse({
      success: false,
      error: errorMessage
    })
  }
}
