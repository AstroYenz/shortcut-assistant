import LabelsContentScript from '@sx/ai/labels/content-script'
import { AiFunctions } from '@sx/analyze/ai-functions'
import { logError } from '@sx/utils/log-error'
import { Story } from '@sx/utils/story'

import { analyzeStoryDescription } from './analyze/analyze-story-description'
import { CycleTime } from './cycle-time/cycle-time'
import { DevelopmentTime } from './development-time/development-time'
import changeIteration from './keyboard-shortcuts/change-iteration'
import changeState from './keyboard-shortcuts/change-state'
import { KeyboardShortcuts } from './keyboard-shortcuts/keyboard-shortcuts'
import { NotesButton } from './notes/notes-button'
import { initializeReact, cleanupReact } from './react-bridge'
import { Todoist } from './todoist/todoist'
import { getSyncedSetting } from './utils/get-synced-setting'


export async function activate(): Promise<void> {
  await Story.isReady()

  new KeyboardShortcuts().activate()

  CycleTime.set().catch(logError)
  DevelopmentTime.set().catch(logError)
  LabelsContentScript.init().catch(logError)
  const aiFunctions = new AiFunctions()
  // Run synchronously to ensure the buttons are added in the correct order
  await aiFunctions.addButtons()
  try {
    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
    if (enableTodoistOptions) {
      // Wait on response because AiFunctions.addAnalyzeButton() will also set a button
      // and async could affect the order
      await Todoist.setTaskButtons()
    }
  }
  catch (e) {
    logError(e as Error)
  }
  new NotesButton()
  // Check if React is enabled in the build
  const isReactEnabled = process.env.ENABLE_REACT === 'true'

  // Initialize React components if compiled into the build
  if (isReactEnabled) {
    try {
      initializeReact()
    }
    catch (e) {
      logError(e as Error)
    }
  }
}

export async function handleMessage(request: { message: string, url: string }): Promise<void> {
  const activeTabUrl = window.location.href
  if (request.message === 'analyzeStoryDescription') {
    await analyzeStoryDescription(activeTabUrl)
  }
  if (request.message === 'update') {
    await Story.isReady()
    DevelopmentTime.set().catch(logError)
    CycleTime.set().catch(logError)
    LabelsContentScript.init().catch(logError)

    const functions = new AiFunctions()
    await functions.addButtons()

    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
    if (enableTodoistOptions) {
      // Wait on response because AiFunctions.addAnalyzeButton() will also set a button
      // and async could affect the order
      await Todoist.setTaskButtons()
    }
    new NotesButton()

    const isReactEnabled = process.env.ENABLE_REACT === 'true'
    // Re-initialize React components if compiled into the build
    if (isReactEnabled) {
      cleanupReact()
      initializeReact()
    }
  }
  if (request.message === 'change-state') {
    await changeState()
  }
  if (request.message === 'change-iteration') {
    await changeIteration()
  }
}

chrome.runtime.onMessage.addListener(handleMessage)

// Listen for messages from the page script (React)
window.addEventListener('message', (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) return

  // Check if the message is from the page script
  const message = event.data
  if (message?.type !== 'FROM_PAGE') return

  const payload = message.message

  // Handle different actions
  if (payload?.action === 'submitShortcutApiToken') {
    handleSubmitShortcutApiToken(payload.data.token)
      .then((response) => {
        window.postMessage({
          type: 'FROM_CONTENT',
          response
        }, '*')
      })
      .catch((error) => {
        window.postMessage({
          type: 'FROM_CONTENT',
          response: {
            success: false,
            error: error.message || 'Failed to submit API token'
          }
        }, '*')
      })
  }

  if (payload?.action === 'initiateGoogleOAuth') {
    handleInitiateGoogleOAuth()
      .then((response) => {
        window.postMessage({
          type: 'FROM_CONTENT',
          response
        }, '*')
      })
      .catch((error) => {
        window.postMessage({
          type: 'FROM_CONTENT',
          response: {
            success: false,
            error: error.message || 'Failed to authenticate with Google'
          }
        }, '*')
      })
  }

  // Other action handlers can be added here
})

// Handle Shortcut API token submission
async function handleSubmitShortcutApiToken(token: string): Promise<{ success: boolean, message: string, error?: string }> {
  try {
    return new Promise((resolve, reject) => {
      // Send the token to the service worker instead of handling auth here
      chrome.runtime.sendMessage({
        action: 'processShortcutApiToken',
        data: { shortcutToken: token }
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        resolve({
          success: response?.success ?? true,
          message: response?.message || 'Token submitted successfully',
          error: response?.error
        })
      })
    })
  }
  catch (error) {
    console.error('Error in handleSubmitShortcutApiToken:', error)
    throw error
  }
}

// Handle Google OAuth authentication
async function handleInitiateGoogleOAuth(): Promise<{ success: boolean, message: string, error?: string }> {
  try {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'initiateGoogleOAuth'
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        resolve({
          success: response?.success ?? true,
          message: response?.message || 'Google authentication successful',
          error: response?.error
        })
      })
    })
  }
  catch (error) {
    console.error('Error in handleInitiateGoogleOAuth:', error)
    throw error
  }
}
