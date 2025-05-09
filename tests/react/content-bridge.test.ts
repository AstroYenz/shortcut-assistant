import {
  initializeReactBridge,
  cleanupReactBridge,
  setupReactMessageListener,
  handleSubmitShortcutApiToken,
  handleInitiateGoogleOAuth
} from '@/content-bridge'

jest.mock('@/index', () => ({
  initReact: jest.fn(),
  unmountReact: jest.fn()
}))

describe('Content Bridge', () => {
  let originalAddEventListener: typeof window.addEventListener
  let originalPostMessage: typeof window.postMessage
  let messageHandler: ((event: MessageEvent) => void) | undefined

  beforeEach(() => {
    originalAddEventListener = window.addEventListener
    originalPostMessage = window.postMessage

    // Mock window.addEventListener to capture the message handler
    window.addEventListener = jest.fn().mockImplementation((type, handler) => {
      if (type === 'message') {
        messageHandler = handler as (event: MessageEvent) => void
      }
    })

    window.postMessage = jest.fn()

    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    window.addEventListener = originalAddEventListener
    window.postMessage = originalPostMessage
  })

  describe('setupReactMessageListener', () => {
    it('adds a message event listener to window', () => {
      setupReactMessageListener()
      expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('ignores messages from different sources', () => {
      setupReactMessageListener()

      if (!messageHandler) throw new Error('Message handler not set')

      const event = {
        source: null, // Different source than window
        data: {
          type: 'FROM_PAGE',
          message: { action: 'submitShortcutApiToken', data: { token: 'test-token' } }
        }
      } as unknown as MessageEvent

      messageHandler(event)
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled()
    })

    it('ignores messages of wrong type', () => {
      setupReactMessageListener()

      if (!messageHandler) throw new Error('Message handler not set')

      const event = {
        source: window,
        data: {
          type: 'NOT_FROM_PAGE',
          message: { action: 'submitShortcutApiToken', data: { token: 'test-token' } }
        }
      } as unknown as MessageEvent

      messageHandler(event)
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled()
    })

    it('handles submitShortcutApiToken action', () => {
      setupReactMessageListener()

      if (!messageHandler) throw new Error('Message handler not set')

      const mockChromeSendMessage = jest.fn().mockImplementation((_message, callback) => {
        callback({ success: true, message: 'Token submitted successfully' })
      })

      chrome.runtime.sendMessage = mockChromeSendMessage

      const event = {
        source: window,
        data: {
          type: 'FROM_PAGE',
          message: { action: 'submitShortcutApiToken', data: { token: 'test-token' } }
        }
      } as unknown as MessageEvent

      messageHandler(event)

      expect(mockChromeSendMessage).toHaveBeenCalledWith(
        {
          action: 'processShortcutApiToken',
          data: { shortcutToken: 'test-token' }
        },
        expect.any(Function)
      )
    })

    it('handles initiateGoogleOAuth action', () => {
      setupReactMessageListener()

      if (!messageHandler) throw new Error('Message handler not set')

      const mockChromeSendMessage = jest.fn().mockImplementation((_message, callback) => {
        callback({ success: true, message: 'Google authentication successful' })
      })

      chrome.runtime.sendMessage = mockChromeSendMessage

      const event = {
        source: window,
        data: {
          type: 'FROM_PAGE',
          message: { action: 'initiateGoogleOAuth' }
        }
      } as unknown as MessageEvent

      messageHandler(event)

      expect(mockChromeSendMessage).toHaveBeenCalledWith(
        {
          action: 'initiateGoogleOAuth'
        },
        expect.any(Function)
      )
    })

    it('sends error response when action fails', async () => {
      setupReactMessageListener()

      if (!messageHandler) throw new Error('Message handler not set')

      const mockChromeSendMessage = jest.fn().mockImplementation((_message, callback) => {
        chrome.runtime.lastError = { message: 'Test error message' }
        callback(undefined)
        chrome.runtime.lastError = undefined
      })

      chrome.runtime.sendMessage = mockChromeSendMessage

      const event = {
        source: window,
        data: {
          type: 'FROM_PAGE',
          message: { action: 'submitShortcutApiToken', data: { token: 'test-token' } }
        }
      } as unknown as MessageEvent

      const postMessageSpy = jest.spyOn(window, 'postMessage')

      messageHandler(event)

      // Wait for the promise rejection
      await new Promise(process.nextTick)

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'FROM_CONTENT',
          response: {
            success: false,
            error: 'Test error message'
          }
        },
        '*'
      )
    })
  })

  describe('handleSubmitShortcutApiToken', () => {
    it('sends message to service worker and resolves with success response', async () => {
      const mockChromeSendMessage = jest.fn().mockImplementation((_message, callback) => {
        callback({ success: true, message: 'Token submitted successfully' })
      })

      chrome.runtime.sendMessage = mockChromeSendMessage

      const result = await handleSubmitShortcutApiToken('test-token')

      expect(mockChromeSendMessage).toHaveBeenCalledWith(
        {
          action: 'processShortcutApiToken',
          data: { shortcutToken: 'test-token' }
        },
        expect.any(Function)
      )

      expect(result).toEqual({
        success: true,
        message: 'Token submitted successfully'
      })
    })

    it('rejects with error when runtime.lastError exists', async () => {
      const mockChromeSendMessage = jest.fn().mockImplementation((_message, callback) => {
        chrome.runtime.lastError = { message: 'Test error message' }
        callback(undefined)
        chrome.runtime.lastError = undefined
      })

      chrome.runtime.sendMessage = mockChromeSendMessage

      await expect(handleSubmitShortcutApiToken('test-token')).rejects.toThrow('Test error message')
    })
  })

  describe('handleInitiateGoogleOAuth', () => {
    it('sends message to service worker and resolves with success response', async () => {
      const mockChromeSendMessage = jest.fn().mockImplementation((_message, callback) => {
        callback({ success: true, message: 'Google authentication successful' })
      })

      chrome.runtime.sendMessage = mockChromeSendMessage

      const result = await handleInitiateGoogleOAuth()

      expect(mockChromeSendMessage).toHaveBeenCalledWith(
        {
          action: 'initiateGoogleOAuth'
        },
        expect.any(Function)
      )

      expect(result).toEqual({
        success: true,
        message: 'Google authentication successful'
      })
    })

    it('rejects with error when runtime.lastError exists', async () => {
      const mockChromeSendMessage = jest.fn().mockImplementation((_message, callback) => {
        chrome.runtime.lastError = { message: 'Test error message' }
        callback(undefined)
        chrome.runtime.lastError = undefined
      })

      chrome.runtime.sendMessage = mockChromeSendMessage

      await expect(handleInitiateGoogleOAuth()).rejects.toThrow('Test error message')
    })
  })

  describe('initializeReactBridge', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('sets up message listener and initializes React', async () => {
      // Mock the dynamic import
      const mockImport = jest.requireMock('@/index')

      // Create a mock for the dynamic import
      const mockDynamicImport = jest.fn().mockResolvedValue({
        initReact: mockImport.initReact,
        unmountReact: mockImport.unmountReact
      })

      // Setup mock for dynamic import
      jest.mock('./index', () => mockImport, { virtual: true })

      // Replace the dynamic import function
      const originalImport = jest.fn()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - mock dynamic import
      global.import = originalImport
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - mock dynamic import
      global.import = mockDynamicImport

      // Call the function
      initializeReactBridge()

      // Verify message listener was set up
      expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))

      // Wait for the promise chain to complete
      await Promise.resolve()
      await Promise.resolve()
      await new Promise(process.nextTick)

      // Verify the React initialization was called
      expect(mockImport.initReact).toHaveBeenCalled()

      // Restore the original import
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - restore original
      global.import = originalImport
    })
  })

  describe('cleanupReactBridge', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('unmounts React components', async () => {
      const mockImport = jest.requireMock('@/index')

      // Create a mock for the dynamic import
      const mockDynamicImport = jest.fn().mockResolvedValue({
        initReact: mockImport.initReact,
        unmountReact: mockImport.unmountReact
      })

      // Replace the dynamic import function
      const originalImport = jest.fn()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - mock dynamic import
      global.import = originalImport
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - mock dynamic import
      global.import = mockDynamicImport

      // Call the function
      cleanupReactBridge()

      // Wait for the promise chain to complete
      await Promise.resolve()
      await Promise.resolve()
      await new Promise(process.nextTick)

      // Verify the React unmount was called
      expect(mockImport.unmountReact).toHaveBeenCalled()

      // Restore the original import
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - restore original
      global.import = originalImport
    })
  })
})
