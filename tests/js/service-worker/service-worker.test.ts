import { chrome } from 'jest-chrome'

import { sendEvent } from '@sx/analytics/event'
import {
  handleGetSavedNotes,
} from '@sx/service-worker/handlers'

import ManifestV3 = chrome.runtime.ManifestV3


jest.mock('@sx/service-worker/handlers', () => ({
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

  it('handles missing tab information correctly', () => {
    const sendResponse = jest.fn()
    chrome.runtime.onMessage.callListeners({
      action: 'callOpenAI',
      data: { prompt: 'prompt' }
    }, {}, sendResponse)

    expect(sendResponse).not.toHaveBeenCalled()
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
