import LabelsServiceWorker from '@sx/ai/labels/service-worker'
import getHeaders from '@sx/auth/headers'
import { Story } from '@sx/utils/story'


jest.mock('@sx/auth/headers', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  }
})
const mockHeaders = getHeaders as jest.Mock

describe('LabelsServiceWorker', () => {
  global.fetch = jest.fn()
  let fetchMock: jest.Mock | undefined

  beforeEach(() => {
    global.fetch = jest.fn()
    fetchMock = global.fetch as jest.Mock
  })


  it('should throw an error if PROXY_URL is not set', async () => {
    process.env.PROXY_URL = ''
    await expect(LabelsServiceWorker.requestLabels()).rejects.toThrow('PROXY_URL is not set')
  })

  it('should throw an error if response is not ok', async () => {
    process.env.PROXY_URL = 'http://localhost:3000'
    fetchMock!.mockResolvedValueOnce({ status: 500, statusText: 'Internal Server Error', ok: false } as Response)
    await expect(LabelsServiceWorker.requestLabels()).rejects.toThrow('Proxy response was not ok. Status: 500 Internal Server Error')
  })

  it('should throw an error if fetch fails', async () => {
    process.env.PROXY_URL = 'http://localhost:3000'
    fetchMock!.mockRejectedValueOnce(new Error('Failed to fetch'))
    await expect(LabelsServiceWorker.requestLabels()).rejects.toThrow('Error getting completion from proxy: Error: Failed to fetch')
  })

  it('should make a fetch request to the proxy', async () => {
    process.env.PROXY_URL = 'http://localhost:3000'
    jest.spyOn(Story, 'id').mockResolvedValue('1')
    mockHeaders.mockResolvedValue({ 'Content-Type': 'application/json' })
    fetchMock!.mockResolvedValueOnce({ status: 200, ok: true } as Response)
    await LabelsServiceWorker.requestLabels()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/labels', {
      method: 'POST',
      body: JSON.stringify({ storyId: '1' }),
      headers: { 'Content-Type': 'application/json' }
    })
  })
})
