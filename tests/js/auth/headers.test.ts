import getHeaders from '@sx/auth/headers'


describe('getHeaders', () => {
  const mockChromeStorageLocalGet = chrome.storage.local.get as jest.Mock

  beforeEach(() => {
    mockChromeStorageLocalGet.mockReset()
  })

  it('returns the headers with the backend key', async () => {
    const backendKey = 'backendKeyValue'
    mockChromeStorageLocalGet.mockResolvedValue({ backendKey })

    const headers = await getHeaders()

    expect(headers).toEqual({
      'Content-Type': 'application/json',
      'Authorization': backendKey
    })
  })
})
