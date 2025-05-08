import registerUser from '@sx/auth/oauth/service-worker/registration'


jest.mock('@sx/auth/oauth/service-worker/listener')
global.chrome = {
  ...chrome,
  storage: {
    ...chrome.storage,
    local: {
      ...chrome.storage.local,
      get: jest.fn(),
      remove: jest.fn()
    },
  },
}

describe('registerUser', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('registers a user successfully', async () => {
    const googleToken = 'testToken'
    const shortcutApiToken = 'shortcutApiTokenValue'

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue({ json: jest.fn().mockReturnValue({ key: '123' }), ok: true })

    process.env.PROXY_URL = 'https://proxy.url'

    await registerUser(googleToken, shortcutApiToken)

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.PROXY_URL}/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'shortcutApiTokenValue'
        },
        body: JSON.stringify({
          shortcutApiToken: shortcutApiToken,
          googleAuthToken: googleToken
        }),
      }
    )
  })

  it('handles errors in fetching user info', async () => {
    const googleToken = 'testToken'
    const shortcutApiToken = 'shortcutApiTokenValue'
    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValueOnce({ ok: false, status: 400 })
    await expect(registerUser(googleToken, shortcutApiToken)).rejects.toThrow('HTTP error. Status: 400')

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.PROXY_URL}/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'shortcutApiTokenValue',
        },
        body: JSON.stringify({
          shortcutApiToken: shortcutApiToken,
          googleAuthToken: googleToken,
        }),
      }
    )
    expect(global.fetch).toHaveBeenCalled()
  })
})
