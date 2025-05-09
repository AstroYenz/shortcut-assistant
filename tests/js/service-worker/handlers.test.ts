import callOpenAi from '@sx/ai/call-openai'
import { handleCommands, handleOpenAICall } from '@sx/service-worker/handlers'


jest.mock('@sx/ai/call-openai')
jest.mock('@sx/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue({}),
}))

const mockCallOpenAi = callOpenAi as jest.MockedFunction<typeof callOpenAi>

const sendMessage = jest.fn()
global.chrome = {
  ...chrome,
  tabs: {
    query: jest.fn().mockResolvedValue([{ id: 123 }]),
    sendMessage: sendMessage
  } as unknown as typeof chrome.tabs
}

describe('Handle OpenAI Call', () => {
  it('should call callOpenAi with the prompt and tabId', async () => {
    const prompt = 'prompt'
    const tabId = 123
    await handleOpenAICall(prompt, 'analyze', tabId)
    expect(mockCallOpenAi).toHaveBeenCalledWith(prompt, 'analyze', tabId)
  })

  it('should return an error if callOpenAi throws an error', async () => {
    const prompt = 'prompt'
    const tabId = 123
    const error = new Error('error')
    mockCallOpenAi.mockRejectedValue(error)
    const response = await handleOpenAICall(prompt, 'breakup', tabId)
    expect(response).toEqual({ error })
  })
})

describe('Handle Get OpenAI Token', () => {
  it('should call getOpenAiToken and return the token', async () => {
    const token = 'mock'
    const getOpenAiToken = jest.fn().mockResolvedValue(token)
    const response = await getOpenAiToken()
    expect(getOpenAiToken).toHaveBeenCalled()
    expect(response).toEqual('mock')
  })
})

describe('Handle Get Saved Notes', () => {
  it('should call Story.notes and return the data', async () => {
    const data = 'mock'
    const notes = jest.fn().mockResolvedValue(data)
    const response = await notes()
    expect(notes).toHaveBeenCalled()
    expect(response).toEqual('mock')
  })
})

describe('Handle Commands', () => {
  it('should send a message to the active tab based on the command', async () => {
    const activeTab = { id: 123 }
    const commands = ['change-state', 'change-iteration']
    for (const command of commands) {
      await handleCommands(command)
      expect(sendMessage).toHaveBeenCalledWith(activeTab.id, { message: command })
    }
  })
})
