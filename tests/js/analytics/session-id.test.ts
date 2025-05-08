import {getOrCreateSessionId} from '@sx/analytics/session-id'


global.chrome = {
  ...global.chrome,
  storage: {
    ...global.chrome.storage,
    session: {
      ...global.chrome.storage.session,
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn()
    }
  }
}

describe('getOrCreateSessionId', () => {
  const originalNow = Date.now
  beforeAll(() => {
    Date.now = jest.fn()
  })

  afterAll(() => {
    Date.now = originalNow
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a new session when none exists', async () => {
    (Date.now as jest.Mock).mockReturnValue(new Date('2020-01-01').getTime())
    chrome.storage.session.get = jest.fn().mockResolvedValue({})

    const sessionId = await getOrCreateSessionId()

    expect(sessionId).toBeDefined()
    expect(global.chrome.storage.session.set).toHaveBeenCalledWith({
      sessionData: {
        session_id: expect.any(String),
        timestamp: expect.any(String)
      }
    })
  })

  it('returns existing session if within expiration limit', async () => {
    (Date.now as jest.Mock).mockReturnValue(new Date('2020-01-01T00:15:00').getTime())
    const sessionData = {
      session_id: 'existing-session-id',
      timestamp: new Date('2020-01-01').getTime().toString() // Session started at 2020-01-01 00:00:00
    }
    global.chrome.storage.session.get = jest.fn().mockResolvedValue({sessionData})

    const sessionId = await getOrCreateSessionId()

    // Expect the existing session_id to be returned, not the current time
    expect(sessionId).toBe('existing-session-id')
    // Verify that the timestamp is updated to keep the session alive
    expect(global.chrome.storage.session.set).toHaveBeenCalledWith({
      sessionData: {
        session_id: 'existing-session-id', // Keep the existing session ID
        timestamp: new Date('2020-01-01T00:15:00').getTime() // Update the timestamp to current time
      }
    })
  })


  it('creates a new session when existing one is past expiration', async () => {
    const currentTime = new Date('2020-01-01T00:31:00').getTime() // 31 minutes later
    Date.now = jest.fn().mockReturnValue(currentTime)
    const sessionData = {
      session_id: 'expired-session-id',
      timestamp: new Date('2020-01-01').getTime().toString()
    }
    global.chrome.storage.session.get = jest.fn().mockResolvedValue({sessionData})

    const sessionId = await getOrCreateSessionId()

    expect(sessionId).not.toBe('expired-session-id')
    expect(global.chrome.storage.session.set).toHaveBeenCalledWith({
      sessionData: {
        session_id: expect.any(String),
        timestamp: currentTime.toString()
      }
    })
  })
})
