import LabelsContentScript from '@sx/ai/labels/content-script'
import { logError } from '@sx/utils/log-error'
import { Story } from '@sx/utils/story'

import { initializeReactBridge, cleanupReactBridge } from '../react/content-bridge'

import { CycleTime } from './cycle-time/cycle-time'
import { DevelopmentTime } from './development-time/development-time'
import changeIteration from './keyboard-shortcuts/change-iteration'
import changeState from './keyboard-shortcuts/change-state'
import { KeyboardShortcuts } from './keyboard-shortcuts/keyboard-shortcuts'
import { NotesButton } from './notes/notes-button'
import { Todoist } from './todoist/todoist'
import { getSyncedSetting } from './utils/get-synced-setting'


export async function activate(): Promise<void> {
  await Story.isReady()

  new KeyboardShortcuts().activate()

  CycleTime.set().catch(logError)
  DevelopmentTime.set().catch(logError)
  LabelsContentScript.init().catch(logError)
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

  initializeReactBridge()
}

export async function handleMessage(request: { message: string, url: string }): Promise<void> {
  if (request.message === 'update') {
    await Story.isReady()
    DevelopmentTime.set().catch(logError)
    CycleTime.set().catch(logError)
    LabelsContentScript.init().catch(logError)

    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
    if (enableTodoistOptions) {
      // Wait on response because AiFunctions.addAnalyzeButton() will also set a button
      // and async could affect the order
      await Todoist.setTaskButtons()
    }
    new NotesButton()

    cleanupReactBridge()
    initializeReactBridge()
  }
  if (request.message === 'change-state') {
    await changeState()
  }
  if (request.message === 'change-iteration') {
    await changeIteration()
  }
}

// NOTE: Message listener moved to unified router in content-bridge.ts
// handleMessage() is now called by the unified router
// Previous `chrome.runtime.onMessage.addListener(handleMessage)` was here
