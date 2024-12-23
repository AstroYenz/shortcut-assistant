import { getOrCreateClientId } from '@sx/analytics/client-id'
import {
  DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
  GA_ENDPOINT,
  GOOGLE_ANALYTICS_API_SECRET,
  MEASUREMENT_ID
} from '@sx/analytics/config'
import { sendEvent } from '@sx/analytics/event'
import { getOrCreateSessionId } from '@sx/analytics/session-id'


jest.mock('../../.old_src/js/analytics/client-id', () => ({
  getOrCreateClientId: jest.fn()
}))
const mockGetOrCreateClientId = getOrCreateClientId as jest.Mock

jest.mock('../../.old_src/js/analytics/session-id', () => ({
  getOrCreateSessionId: jest.fn()
}))
const mockGetOrCreateSessionId = getOrCreateSessionId as jest.Mock

describe('sendEvent', () => {
  const fakeClientId = 'fake-client-id'
  const fakeSessionId = 'fake-session-id'
  const version = '1.0.0'
  global.fetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetOrCreateClientId.mockResolvedValue(fakeClientId)
    mockGetOrCreateSessionId.mockResolvedValue(fakeSessionId)
  })

  it('calls the correct GA endpoint with the right parameters', async () => {
    const eventName = 'test_event'
    const additionalParams = { key: 'value' }

    await sendEvent(eventName, additionalParams)

    expect(fetch).toHaveBeenCalledWith(
      `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          client_id: fakeClientId,
          events: [
            {
              name: eventName,
              params: {
                client_id: fakeClientId,
                session_id: fakeSessionId,
                engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
                debug_mode: false,
                internal: false,
                version,
                ...additionalParams
              }
            }
          ]
        })
      })
    )
  })

  it('ensures getOrCreateClientId and getOrCreateSessionId are called', async () => {
    await sendEvent('test_event')

    expect(getOrCreateClientId).toHaveBeenCalledTimes(2) // Since it's called twice within the function
    expect(getOrCreateSessionId).toHaveBeenCalledTimes(1)
  })
})
