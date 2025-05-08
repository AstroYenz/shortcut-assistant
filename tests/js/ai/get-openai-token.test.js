import getOpenAiToken from '@sx/ai/get-openai-token'


describe('getOpenAiToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the token when it exists', async () => {
    const expectedToken = 'test-token'
    chrome.storage.local.get.mockImplementation((key, callback) => {
      if (typeof callback !== 'function') {
        return { openAIToken: expectedToken }
      }
      callback({ openAIToken: expectedToken })
    })

    const token = await getOpenAiToken()
    expect(token).toEqual(expectedToken)
    expect(chrome.storage.local.get).toHaveBeenCalledWith('openAIToken')
  })

  it('should return null when the token does not exist', async () => {
    chrome.storage.local.get.mockImplementation((key, callback) => {
      if (typeof callback !== 'function') {
        return {}
      }
      callback({})
    })
    const token = await getOpenAiToken()
    expect(token).toBeNull()
    expect(chrome.storage.local.get).toHaveBeenCalledWith('openAIToken')
  })

  it('should throw an error when chrome.storage.local.get fails', async () => {
    const errorMessage = 'Error getting OpenAI token'
    chrome.storage.local.get.mockImplementation(() => {
      throw new Error(errorMessage)
    })
    console.error = jest.fn()

    await expect(getOpenAiToken()).rejects.toThrow(errorMessage)
    expect(console.error).toHaveBeenCalledWith('Error getting OpenAI token:', expect.any(Error))
  })
})
