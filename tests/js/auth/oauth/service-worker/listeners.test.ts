import IpcRequest from '@sx/types/ipc-request'

import { handleProcessShortcutApiToken, handleInitiateGoogleOAuth } from '@/service-worker/auth/listeners'
import { registerUser } from '@/service-worker/auth/registration'


type ResponseType = { success: boolean, message?: string, error?: string }

// Define a type for Chrome runtime LastError
interface ChromeLastError {
  message: string
}

// Mock registerUser
jest.mock('@/service-worker/auth/registration', () => ({
  registerUser: jest.fn()
}))

// Setup Chrome mocks
global.chrome = {
  ...global.chrome,
  runtime: {
    ...global.chrome.runtime,
    lastError: undefined,
    onMessage: {
      ...global.chrome.runtime.onMessage,
      addListener: jest.fn()
    }
  },
  identity: {
    ...global.chrome.identity,
    getAuthToken: jest.fn()
  },
  storage: {
    ...global.chrome.storage,
    local: {
      ...global.chrome.storage.local,
      get: jest.fn(),
      set: jest.fn()
    }
  }
}

describe('Auth Service Worker Listeners', () => {
  let sendResponse: jest.Mock<void, [response?: ResponseType]>
  const mockRegisterUser = jest.mocked(registerUser)
  const mockGetAuthToken = jest.mocked(chrome.identity.getAuthToken)
  const mockStorageGet = jest.mocked(chrome.storage.local.get)
  const mockStorageSet = jest.mocked(chrome.storage.local.set)

  beforeEach(() => {
    jest.clearAllMocks()
    sendResponse = jest.fn()
    global.chrome.runtime.lastError = undefined

    // Default mock implementations
    mockRegisterUser.mockResolvedValue(undefined)
    // For chrome.storage.local.set
    mockStorageSet.mockImplementation((data, callback) => {
      if (callback) callback()
      return Promise.resolve()
    })
  })

  describe('handleProcessShortcutApiToken', () => {
    it('processes token with existing temporary Google token', async () => {
      // Mock storage with existing temp Google token
      mockStorageGet.mockImplementation((key, callback) => {
        callback({ tempGoogleToken: 'google-temp-token' })
      })

      // Call the handler
      handleProcessShortcutApiToken('shortcut-api-token', sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify registerUser was called with correct tokens
      expect(mockRegisterUser).toHaveBeenCalledWith('google-temp-token', 'shortcut-api-token')

      // Verify successful response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Token submitted successfully'
      })
    })

    it('falls back to requesting a new Google token when no temporary token exists', async () => {
      // Mock storage with no temp Google token
      mockStorageGet.mockImplementation((key, callback) => {
        callback({})
      })

      // Mock successful Google auth token generation
      mockGetAuthToken.mockImplementation((options, callback) => {
        callback('new-google-token')
      })

      // Call the handler
      handleProcessShortcutApiToken('shortcut-api-token', sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify identity.getAuthToken was called
      expect(mockGetAuthToken).toHaveBeenCalledWith({ interactive: true }, expect.any(Function))

      // Verify registerUser was called with new Google token
      expect(mockRegisterUser).toHaveBeenCalledWith('new-google-token', 'shortcut-api-token')

      // Verify successful response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Token submitted successfully'
      })
    })

    it('handles Chrome runtime error during Google auth', async () => {
      // Mock storage with no temp Google token
      mockStorageGet.mockImplementation((key, callback) => {
        callback({})
      })

      // Mock Chrome runtime error
      mockGetAuthToken.mockImplementation((options, callback) => {
        global.chrome.runtime.lastError = { message: 'Auth error' } as ChromeLastError
        callback(undefined)
        global.chrome.runtime.lastError = undefined
      })

      // Call the handler
      handleProcessShortcutApiToken('shortcut-api-token', sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Auth error'
      })
    })

    it('handles null token response during Google auth', async () => {
      // Mock storage with no temp Google token
      mockStorageGet.mockImplementation((key, callback) => {
        callback({})
      })

      // Mock null token response (without error)
      mockGetAuthToken.mockImplementation((options, callback) => {
        callback(undefined)
      })

      // Call the handler
      handleProcessShortcutApiToken('shortcut-api-token', sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'No token received'
      })
    })

    it('handles registration errors', async () => {
      // Mock storage with temp Google token
      mockStorageGet.mockImplementation((key, callback) => {
        callback({ tempGoogleToken: 'google-temp-token' })
      })

      // Mock registration error
      mockRegisterUser.mockRejectedValueOnce(new Error('Registration failed'))

      // Call the handler
      handleProcessShortcutApiToken('shortcut-api-token', sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Registration failed'
      })
    })

    it('handles unexpected errors', () => {
      // Mock storage to throw error
      mockStorageGet.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      // Call the handler
      handleProcessShortcutApiToken('shortcut-api-token', sendResponse)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected error'
      })
    })
  })

  describe('handleInitiateGoogleOAuth', () => {
    it('successfully initiates Google OAuth', async () => {
      // Mock successful Google auth token generation
      mockGetAuthToken.mockImplementation((options, callback) => {
        callback('google-token')
      })

      // Call the handler
      handleInitiateGoogleOAuth(sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify identity.getAuthToken was called
      expect(mockGetAuthToken).toHaveBeenCalledWith({ interactive: true }, expect.any(Function))

      // Verify token was stored temporarily
      expect(mockStorageSet).toHaveBeenCalledWith({ tempGoogleToken: 'google-token' })

      // Verify successful response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Google authentication successful'
      })
    })

    it('handles Chrome runtime error during Google OAuth', async () => {
      // Mock Chrome runtime error
      mockGetAuthToken.mockImplementation((options, callback) => {
        global.chrome.runtime.lastError = { message: 'Auth error' } as ChromeLastError
        callback(undefined)
        global.chrome.runtime.lastError = undefined
      })

      // Call the handler
      handleInitiateGoogleOAuth(sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Auth error'
      })
    })

    it('handles null token response during Google OAuth', async () => {
      // Mock null token response (without error)
      mockGetAuthToken.mockImplementation((options, callback) => {
        callback(undefined)
      })

      // Call the handler
      handleInitiateGoogleOAuth(sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'No token received'
      })
    })

    it('handles errors when storing token', async () => {
      // Mock successful Google auth token generation
      mockGetAuthToken.mockImplementation((options, callback) => {
        callback('google-token')
      })

      // Mock storage.set to throw error
      mockStorageSet.mockImplementationOnce((data, callback) => {
        return Promise.reject(new Error('Storage error'))
      })

      // Call the handler
      handleInitiateGoogleOAuth(sendResponse)

      // Wait for promises to resolve
      await new Promise(process.nextTick)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Storage error'
      })
    })

    it('handles unexpected errors', () => {
      // Mock getAuthToken to throw error
      mockGetAuthToken.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      // Call the handler
      handleInitiateGoogleOAuth(sendResponse)

      // Verify error response was sent
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected error'
      })
    })
  })

  describe('Chrome message listener', () => {
    it('should listen for processShortcutApiToken action', () => {
      // We need to use require here to ensure the listener is added
      const mockAddListener = jest.fn()
      chrome.runtime.onMessage.addListener = mockAddListener

      // Import the module to trigger listener registration
      jest.isolateModules(() => {
        require('@/service-worker/auth/listeners')
      })

      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function))

      // Get the listener function
      const listenerFunc = mockAddListener.mock.calls[0][0]

      // Create a mock request for processShortcutApiToken
      const request: IpcRequest = {
        action: 'processShortcutApiToken',
        data: { shortcutToken: 'test-token' }
      }

      // Call the listener
      const result = listenerFunc(request, {}, sendResponse)

      // Expect true to be returned to keep the message channel open
      expect(result).toBe(true)
    })

    it('should listen for initiateGoogleOAuth action', () => {
      // We need to use require here to ensure the listener is added
      const mockAddListener = jest.fn()
      chrome.runtime.onMessage.addListener = mockAddListener

      // Import the module to trigger listener registration
      jest.isolateModules(() => {
        require('@/service-worker/auth/listeners')
      })

      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function))

      // Get the listener function
      const listenerFunc = mockAddListener.mock.calls[0][0]

      // Create a mock request for initiateGoogleOAuth
      const request: IpcRequest = {
        action: 'initiateGoogleOAuth',
        data: {}
      }

      // Call the listener
      const result = listenerFunc(request, {}, sendResponse)

      // Expect true to be returned to keep the message channel open
      expect(result).toBe(true)
    })
  })
})
