import callOpenAI from '@sx/ai/call-openai'
import { fetchCompletion } from '@sx/ai/fetch-completion'
import getCompletionFromProxy from '@sx/ai/get-completion-from-proxy'
import getOpenAiToken from '@sx/ai/get-openai-token'
import { sendEvent } from '@sx/analytics/event'
import { OpenAIError } from '@sx/utils/errors'


jest.mock('@sx/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue(undefined),
  getOrCreateClientId: jest.fn().mockResolvedValue('test-client-id')
}))
const mockSendEvent = sendEvent as jest.MockedFunction<typeof sendEvent>

jest.mock('@sx/ai/fetch-completion', () => {
  return {
    fetchCompletion: jest.fn()
  }
})
const mockFetchCompletion = fetchCompletion as jest.MockedFunction<typeof fetchCompletion>

jest.mock('@sx/ai/get-completion-from-proxy', () => jest.fn())

jest.mock('@sx/ai/get-openai-token', () => jest.fn())
const mockGetOpenAiToken = getOpenAiToken as jest.MockedFunction<typeof getOpenAiToken>

global.chrome = {
  ...chrome,
  tabs: {
    ...chrome.tabs,
    sendMessage: jest.fn()
  },
  runtime: {
    ...chrome.runtime,
    sendMessage: jest.fn()
  }
}

describe('callOpenAI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use proxy when no token is available', async () => {
    const description = 'test description'
    const tabId = 123
    mockGetOpenAiToken.mockResolvedValue(null)

    await callOpenAI(description, 'analyze', tabId)

    expect(getCompletionFromProxy).toHaveBeenCalledWith(description, 'analyze', tabId)
  })

  it('should call fetchCompletion and send event when token is provided', async () => {
    const description = 'test description'
    const tabId = 123
    const token = 'test-token'

    mockGetOpenAiToken.mockResolvedValue(token)

    await callOpenAI(description, 'analyze', tabId)

    expect(mockFetchCompletion).toHaveBeenCalledWith(description, 'analyze', tabId, token)
    expect(sendEvent).toHaveBeenCalledWith('ai', { token_provided: true, type: 'analyze' })
  })

  it('should throw OpenAIError when fetchCompletion fails', async () => {
    const description = 'test description'
    const tabId = 123
    const token = 'test-token'
    const errorMessage = 'Test error'

    mockGetOpenAiToken.mockResolvedValue(token)
    mockFetchCompletion.mockRejectedValue(new Error(errorMessage))

    await expect(callOpenAI(description, 'analyze', tabId))
      .rejects
      .toThrow(new OpenAIError('Error getting completion from OpenAI: Error: ' + errorMessage))
  })


  it('should log error and capture exception when sending event fails', async () => {
    const description = 'test description'
    const tabId = 123
    const token = 'test-token'
    const errorMessage = 'Test error'
    console.error = jest.fn()

    mockGetOpenAiToken.mockResolvedValue(token)
    const error = new Error(errorMessage)
    mockSendEvent.mockRejectedValue(error)
    mockFetchCompletion.mockResolvedValue(undefined)

    await callOpenAI(description, 'analyze', tabId) // Ensure this waits for all promises

    expect(console.error).toHaveBeenCalledWith('Error sending event:', error)
  })
})
