import { MessageResponse } from '@sx/types/message-response'

import { submitShortcutApiToken, initiateGoogleOAuth } from '@/bridge'


describe('React Bridge', () => {
  let originalPostMessage: typeof window.postMessage
  let originalAddEventListener: typeof window.addEventListener
  let originalRemoveEventListener: typeof window.removeEventListener

  beforeEach(() => {
    originalPostMessage = window.postMessage
    originalAddEventListener = window.addEventListener
    originalRemoveEventListener = window.removeEventListener
    window.postMessage = jest.fn()
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()
  })

  afterEach(() => {
    window.postMessage = originalPostMessage
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
    jest.clearAllMocks()
  })

  function mockMessageEvent(response: MessageResponse): MessageEvent {
    return {
      data: {
        type: 'FROM_CONTENT',
        response
      }
    } as MessageEvent
  }

  it('submitShortcutApiToken sends correct message and resolves with response', async () => {
    const token = 'test-token'
    const expectedMessage = {
      action: 'submitShortcutApiToken',
      data: { token }
    }
    const mockResponse: MessageResponse = { success: true, message: 'ok' }
    let listener: ((event: MessageEvent) => void) | undefined

    (window.addEventListener as jest.Mock).mockImplementation((type, cb) => {
      if (type === 'message') {
        listener = cb as (event: MessageEvent) => void
      }
    })

    const promise = submitShortcutApiToken(token)

    expect(window.postMessage).toHaveBeenCalledWith({ type: 'FROM_PAGE', message: expectedMessage }, '*')
    expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))

    // Simulate receiving the response
    if (listener) {
      listener(mockMessageEvent(mockResponse))
    }

    await expect(promise).resolves.toEqual(mockResponse)
    expect(window.removeEventListener).toHaveBeenCalledWith('message', listener)
  })

  it('initiateGoogleOAuth sends correct message and resolves with response', async () => {
    const expectedMessage = {
      action: 'initiateGoogleOAuth',
      data: {}
    }
    const mockResponse: MessageResponse = { success: true, message: 'oauth success' }
    let listener: ((event: MessageEvent) => void) | undefined

    (window.addEventListener as jest.Mock).mockImplementation((type, cb) => {
      if (type === 'message') {
        listener = cb as (event: MessageEvent) => void
      }
    })

    const promise = initiateGoogleOAuth()

    expect(window.postMessage).toHaveBeenCalledWith({ type: 'FROM_PAGE', message: expectedMessage }, '*')
    expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))

    // Simulate receiving the response
    if (listener) {
      listener(mockMessageEvent(mockResponse))
    }

    await expect(promise).resolves.toEqual(mockResponse)
    expect(window.removeEventListener).toHaveBeenCalledWith('message', listener)
  })
})
