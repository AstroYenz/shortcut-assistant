import { registerUser } from '@/service-worker/auth/registration'


describe('registerUser', () => {
  const originalFetch = global.fetch
  const originalEnv = process.env

  beforeEach(() => {
    global.fetch = jest.fn()
    process.env = { ...originalEnv, PROXY_URL: 'https://test-proxy.url' }

    // Setup chrome storage mock
    chrome.storage.local.set = jest.fn().mockResolvedValue({})
    chrome.storage.local.remove = jest.fn().mockResolvedValue({})
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
    jest.resetAllMocks()
  })

  it('should register user successfully and store backend key', async () => {
    // Arrange
    const googleToken = 'test-google-token'
    const shortcutToken = 'test-shortcut-token'
    const backendKey = 'test-backend-key'

    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ key: backendKey })
    }

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue(mockResponse)

    // Act
    await registerUser(googleToken, shortcutToken)

    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.PROXY_URL}/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': shortcutToken
        },
        body: JSON.stringify({
          shortcutApiToken: shortcutToken,
          googleAuthToken: googleToken,
        }),
      }
    )

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ backendKey })
    expect(chrome.storage.local.remove).toHaveBeenCalledWith('tempGoogleToken')
  })

  it('should throw an error when the response is not ok', async () => {
    // Arrange
    const googleToken = 'test-google-token'
    const shortcutToken = 'test-shortcut-token'

    const mockResponse = {
      ok: false,
      status: 401
    }

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue(mockResponse)

    // Act & Assert
    await expect(registerUser(googleToken, shortcutToken))
      .rejects.toThrow('HTTP error. Status: 401')

    expect(chrome.storage.local.set).not.toHaveBeenCalled()
    expect(chrome.storage.local.remove).not.toHaveBeenCalled()
  })

  it('should throw an error when fetch fails', async () => {
    // Arrange
    const googleToken = 'test-google-token'
    const shortcutToken = 'test-shortcut-token'

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockRejectedValue(new Error('Network error'))

    // Act & Assert
    await expect(registerUser(googleToken, shortcutToken))
      .rejects.toThrow('Network error')

    expect(chrome.storage.local.set).not.toHaveBeenCalled()
    expect(chrome.storage.local.remove).not.toHaveBeenCalled()
  })
})
