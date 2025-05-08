import { sendEvent } from '@sx/analytics/event'
import {
  redirectFromOmnibox,
  setOmniboxSuggestion
} from '@sx/service-worker/omnibox/omnibox'


jest.mock('@sx/analytics/event', () => ({
  sendEvent: jest.fn(() => Promise.resolve())
}))


jest.mock('@sx/service-worker/omnibox/omnibox', () => ({
  redirectFromOmnibox: jest.fn(),
  setOmniboxSuggestion: jest.fn(() => Promise.resolve())
}))

describe('Omnibox interactions', () => {
  // @ts-expect-error Migrating from TS
  let inputChangedCallback
  // @ts-expect-error Migrating from TS
  let inputEnteredCallback

  beforeAll(() => {
    global.chrome = {
      ...global.chrome,
      omnibox: {
        // @ts-expect-error Migrating from TS
        onInputChanged: {
          addListener: jest.fn((callback) => {
            inputChangedCallback = callback
          })
        },
        // @ts-expect-error Migrating from TS
        onInputEntered: {
          addListener: jest.fn((callback) => {
            inputEnteredCallback = callback
          })
        }
      }
    }
    require('@sx/service-worker/omnibox/listeners') // Ensure the listeners are registered
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets omnibox suggestion on input changed', async () => {
    // @ts-expect-error Migrating from TS
    await inputChangedCallback('test query')
    expect(setOmniboxSuggestion).toHaveBeenCalledWith('test query')
  })

  it('redirects from omnibox and sends event on input entered', () => {
    // @ts-expect-error Migrating from TS
    inputEnteredCallback('test query', 'currentTab')
    expect(redirectFromOmnibox).toHaveBeenCalledWith('test query', 'currentTab')
    expect(sendEvent).toHaveBeenCalledWith('omnibox_entered')
  })
})
