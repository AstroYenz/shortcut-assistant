import { getOrCreateClientId } from './client-id'
import {
  DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
  GA_ENDPOINT,
  GOOGLE_ANALYTICS_API_SECRET,
  MEASUREMENT_ID
} from './config'
import { getOrCreateSessionId } from './session-id'


const version: string = chrome.runtime.getManifest().version


export async function sendEvent(eventName: string, params = {}): Promise<void> {
  fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: await getOrCreateClientId(),
        events: [
          {
            name: eventName,
            params: {
              client_id: await getOrCreateClientId(),
              session_id: await getOrCreateSessionId(),
              engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
              debug_mode: process.env.NODE_ENV === 'development',
              internal: process.env.NODE_ENV === 'development',
              version,
              ...params
            }
          }
        ]
      })
    }
  )
}
