import OpenAI from 'openai'

import { fetchCompletion } from '@sx/ai/fetch-completion'
import { AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'

// Mock the required modules
jest.mock('openai')

const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>

describe('fetchCompletion', () => {
  const fakeToken = 'fake_token'
  const tabId = 123
  const description = 'Test description'

  beforeEach(() => {
    jest.clearAllMocks()

    const mockCreate = jest.fn().mockImplementation(() => {
      const mockStream = (function* (): Generator<{ choices: [{ delta: { content: string } }] }> {
        yield { choices: [{ delta: { content: 'response from OpenAI' } }] }
      })()
      return mockStream
    })

    // @ts-expect-error Migrating to TS
    mockOpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  })

  it('successfully fetches and handles data from OpenAI', async () => {
    await fetchCompletion(description, 'analyze', tabId, 'fake_token')

    // Check OpenAI was initialized correctly
    expect(mockOpenAI).toHaveBeenCalledWith({ apiKey: fakeToken })

    // Verify messages sent to the Chrome tab
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      status: AiProcessMessageType.updated,
      data: {
        content: 'response from OpenAI',
        type: 'analyze'
      }
    })

    // Check final message to runtime
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ status: AiProcessMessageType.completed, message: 'analyze' })
  })
})
