import { checkAuthentication } from '@/client/lib/auth-check'


describe('checkAuthentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns authenticated when both tempGoogleToken and backendKey are present', async () => {
    const mockGet = jest.mocked(chrome.storage.local.get)
    mockGet.mockImplementation((keys, callback) => {
      callback({ tempGoogleToken: 'test-token', backendKey: 'test-key' })
    })

    const result = await checkAuthentication()

    expect(result).toEqual({
      isAuthenticated: true,
      hasGoogleAuth: true,
      hasShortcutToken: true
    })
  })

  it('returns authenticated when only backendKey is present', async () => {
    const mockGet = jest.mocked(chrome.storage.local.get)
    mockGet.mockImplementation((keys, callback) => {
      callback({ backendKey: 'test-key' })
    })

    const result = await checkAuthentication()

    expect(result).toEqual({
      isAuthenticated: true,
      hasGoogleAuth: true,
      hasShortcutToken: true
    })
  })

  it('returns not authenticated when only tempGoogleToken is present', async () => {
    const mockGet = jest.mocked(chrome.storage.local.get)
    mockGet.mockImplementation((keys, callback) => {
      callback({ tempGoogleToken: 'test-token' })
    })

    const result = await checkAuthentication()

    expect(result).toEqual({
      isAuthenticated: false,
      hasGoogleAuth: true,
      hasShortcutToken: false
    })
  })

  it('returns not authenticated when neither token is present', async () => {
    const mockGet = jest.mocked(chrome.storage.local.get)
    mockGet.mockImplementation((keys, callback) => {
      callback({})
    })

    const result = await checkAuthentication()

    expect(result).toEqual({
      isAuthenticated: false,
      hasGoogleAuth: false,
      hasShortcutToken: false
    })
  })

  it('handles empty string values as not authenticated', async () => {
    const mockGet = jest.mocked(chrome.storage.local.get)
    mockGet.mockImplementation((keys, callback) => {
      callback({ tempGoogleToken: '', backendKey: '' })
    })

    const result = await checkAuthentication()

    expect(result).toEqual({
      isAuthenticated: false,
      hasGoogleAuth: false,
      hasShortcutToken: false
    })
  })
})
