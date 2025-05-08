import {getSyncedSetting} from '@sx/utils/get-synced-setting'


global.chrome = {
  ...global.chrome,
  // @ts-expect-error Mocking chrome storage
  storage: {
    ...global.chrome.storage,
    sync: {
      get: jest.fn((key, callback) => {
        const data = {test: 'expectedValue'}
        if (typeof callback === 'function') {
          callback(data)
        }
        return data
      }) as jest.Mock,
      set: jest.fn((data, callback) => {
        if (typeof callback === 'function') {
          callback()
        }
      }) as jest.Mock
    }
  } as unknown as jest.Mocked<chrome.storage.StorageArea>,
}


describe('getSyncedSetting function', () => {
  it('fetches the setting successfully', async () => {
    const setting = 'test'
    const defaultValue = 'defaultValue'
    const expectedValue = 'expectedValue'

    const syncedSetting = await getSyncedSetting(setting, defaultValue)
    expect(syncedSetting).toEqual(expectedValue)
  })

  it('returns default value if setting is not found', async () => {
    const setting = 'test'
    const defaultValue = 'defaultValue'

    global.chrome.storage.sync.get = jest.fn().mockImplementation((key, callback) => {
      if (typeof callback === 'function') {
        callback({})
      }
      return {}
    })

    const value = await getSyncedSetting(setting, defaultValue)
    expect(value).toEqual(defaultValue)
  })

  it('throws error if fetching setting fails', async () => {
    const setting = 'test'
    const defaultValue = 'defaultValue'
    const error = new Error('Failed to fetch')
    global.chrome.storage.sync.get = jest.fn().mockImplementation((key, callback) => {
      if (typeof callback === 'function') {
        throw error
      }
      if (key === setting) {
        throw error
      }
    })

    await expect(getSyncedSetting(setting, defaultValue)).rejects.toThrow(error)
    expect(console.error).toHaveBeenCalledWith('Error getting setting value:', error)
  })
})
