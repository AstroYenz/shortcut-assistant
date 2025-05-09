global.chrome = {
  action: {
    setBadgeText: jest.fn().mockResolvedValue({}),
    setBadgeBackgroundColor: jest.fn().mockResolvedValue({}),
    getBadgeText: jest.fn(),
    getBadgeBackgroundColor: jest.fn()
  },
  runtime: {
    lastError: null,
    onInstalled: {
      addListener: jest.fn()
    },
    getManifest: jest.fn().mockImplementation(() => {
      return {
        version: '1.0.0'
      }
    }),
    sendMessage: jest.fn().mockImplementation(() => {
      return Promise.resolve()
    }),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn((key, callback) => {
        if (typeof callback === 'function') {
          callback({ [key]: 'expectedValue' })
        }
        else {
          return { [key]: 'expectedValue' }
        }
      })
    },
    sync: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn((key, callback) => {
        if (typeof callback === 'function') {
          callback({ [key]: 'expectedValue' })
        }
      })
    },
    session: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn((key, callback) => {
        if (typeof callback === 'function') {
          callback({ [key]: 'expectedValue' })
        }
      })
    }
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      if (typeof callback === 'function') {
        callback([{ url: 'https://jestjs.io' }])
      }
      else {
        return [{ url: 'https://jestjs.io' }]
      }
    }),
    onUpdated: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  windows: {
    create: jest.fn()
  }
}
global.tailwind = {
  config: {}
}
