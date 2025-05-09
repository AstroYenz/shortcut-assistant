import LabelsContentScript from '@sx/ai/labels/content-script'
import { AiFunctions } from '@sx/analyze/ai-functions'
import { logError } from '@sx/utils/log-error'
import { Story } from '@sx/utils/story'

import { initializeReactBridge, cleanupReactBridge } from '../react/content-bridge'

import { analyzeStoryDescription } from './analyze/analyze-story-description'
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
      initializeReactBridge()
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
      cleanupReactBridge()
      initializeReactBridge()
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
