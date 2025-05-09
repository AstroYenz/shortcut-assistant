import { chrome } from 'jest-chrome'

import { sendEvent } from '@sx/analytics/event'
import {
  handleGetSavedNotes,
  handleOpenAICall
} from '@sx/service-worker/handlers'

import Tab = chrome.tabs.Tab
import ManifestV3 = chrome.runtime.ManifestV3


jest.mock('@sx/service-worker/handlers', () => ({
  handleOpenAICall: jest.fn().mockResolvedValue({ data: 'mock' }),
  handleGetSavedNotes: jest.fn().mockResolvedValue({ data: 'mock' }),
}))

jest.mock('@sx/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue({}),
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
Object.assign(global, require('jest-chrome'))


describe('chrome.runtime.onMessage listener', () => {
  require('@sx/service-worker/listeners')

  const manifest: ManifestV3 = {
    name: 'shortcut assistant mock',
    version: '1.0.0',
    manifest_version: 3,
  }

  chrome.runtime.getManifest.mockImplementation(() => manifest)
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls handleOpenAICall if action is "callOpenAI"', async () => {
    const sendResponse = jest.fn()
    const mockTabId = 123
    const mockPrompt = 'How to use Jest with TypeScript?'


    chrome.runtime.onMessage.callListeners({
      action: 'callOpenAI',
      data: { prompt: mockPrompt }
    }, { tab: { id: mockTabId, index: 0, pinned: false, windowId: 1, active: true } as Tab }, sendResponse)

    expect(handleOpenAICall).toHaveBeenCalledWith(mockPrompt, undefined, mockTabId)
    await new Promise(process.nextTick) // Wait for all promises to resolve
    expect(sendResponse).toHaveBeenCalled()
  })

  it('handles missing tab information correctly', () => {
    const sendResponse = jest.fn()
    chrome.runtime.onMessage.callListeners({
      action: 'callOpenAI',
      data: { prompt: 'prompt' }
    }, {}, sendResponse)

    expect(sendResponse).not.toHaveBeenCalled()
    expect(handleOpenAICall).not.toHaveBeenCalled()
  })

  it('calls handleGetSavedNotes when action is "getSavedNotes"', async () => {
    const sendResponse = jest.fn()

    chrome.runtime.onMessage.callListeners({
      action: 'getSavedNotes'
    }, {}, sendResponse)

    await new Promise(process.nextTick)
    expect(handleGetSavedNotes).toHaveBeenCalled()
    expect(sendResponse).toHaveBeenCalled()
  })

  it('calls sendEvent when action is "sendEvent" and data is valid', () => {
    const sendResponse = jest.fn()
    const mockEventName = 'userLogin'
    const mockParams = { user: 'testUser' }

    require('@sx/service-worker/service-worker')

    chrome.runtime.onMessage.callListeners({
      action: 'sendEvent',
      data: { eventName: mockEventName, params: mockParams }
    }, {}, sendResponse)

    // await new Promise(process.nextTick)
    expect(sendEvent).toHaveBeenCalledWith(mockEventName, mockParams)
  })
})
