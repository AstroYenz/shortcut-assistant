import { getOrCreateClientId } from '@sx/analytics/client-id'


const get = jest.fn().mockResolvedValue({ clientId: 'randomClientId' })
const set = jest.fn()

global.chrome = {
  ...chrome,
  storage: {
    ...chrome.storage,
    sync: {
      ...chrome.storage.sync,
      get: get,
      set: set
    }
  }
}

describe('getOrCreateClientId function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return clientId when there is an existing Id in chrome storage', async () => {
    const expectedClientId = 'randomClientId'
    get.mockResolvedValue({ clientId: expectedClientId })
    const result = await getOrCreateClientId()
    expect(get).toHaveBeenCalledWith('clientId')
    expect(result).toBe(expectedClientId)
  })

  it('should create and return a new clientId when there isn\'t an existing Id in chrome storage', async () => {
    get.mockResolvedValue({})
    const result = await getOrCreateClientId()
    expect(get).toHaveBeenCalledWith('clientId')
    expect(set).toHaveBeenCalledWith({ clientId: result })
    expect(result).toEqual(expect.any(String))
  })
})
