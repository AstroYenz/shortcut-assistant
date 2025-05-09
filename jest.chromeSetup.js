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
  identity: {
    getAuthToken: jest.fn().mockImplementation((options, callback) => {
      if (typeof callback === 'function') {
        callback('mock-auth-token')
      }
      return Promise.resolve('mock-auth-token')
    })
  },
  storage: {
    local: {
      set: jest.fn().mockImplementation((data, callback) => {
        if (typeof callback === 'function') {
          callback()
        }
        return Promise.resolve()
      }),
      get: jest.fn().mockImplementation((keys, callback) => {
        const result = typeof keys === 'string' ? { [keys]: 'expectedValue' } : { ...keys }
        if (typeof callback === 'function') {
          callback(result)
        }
        return Promise.resolve(result)
      })
    },
    sync: {
      set: jest.fn().mockImplementation((data, callback) => {
        if (typeof callback === 'function') {
          callback()
        }
        return Promise.resolve()
      }),
      get: jest.fn().mockImplementation((keys, callback) => {
        const result = typeof keys === 'string' ? { [keys]: 'expectedValue' } : { ...keys }
        if (typeof callback === 'function') {
          callback(result)
        }
        return Promise.resolve(result)
      })
    },
    session: {
      set: jest.fn().mockImplementation((data, callback) => {
        if (typeof callback === 'function') {
          callback()
        }
        return Promise.resolve()
      }),
      get: jest.fn().mockImplementation((keys, callback) => {
        const result = typeof keys === 'string' ? { [keys]: 'expectedValue' } : { ...keys }
        if (typeof callback === 'function') {
          callback(result)
        }
        return Promise.resolve(result)
      })
    }
  },
  tabs: {
    query: jest.fn().mockImplementation((queryInfo, callback) => {
      const result = [{ url: 'https://jestjs.io' }]
      if (typeof callback === 'function') {
        callback(result)
      }
      return Promise.resolve(result)
    }),
    update: jest.fn().mockImplementation((updateProperties, callback) => {
      if (typeof callback === 'function') {
        callback()
      }
      return Promise.resolve()
    }),
    create: jest.fn().mockImplementation((createProperties, callback) => {
      const tab = { id: 123, ...createProperties }
      if (typeof callback === 'function') {
        callback(tab)
      }
      return Promise.resolve(tab)
    }),
    onUpdated: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn().mockImplementation((tabId, message, options, callback) => {
      if (typeof options === 'function') {
        options()
        return Promise.resolve()
      }
      if (typeof callback === 'function') {
        callback()
      }
      return Promise.resolve()
    })
  },
  windows: {
    create: jest.fn().mockImplementation((createData, callback) => {
      const window = { id: 456, ...createData }
      if (typeof callback === 'function') {
        callback(window)
      }
      return Promise.resolve(window)
    })
  },
  omnibox: {
    setDefaultSuggestion: jest.fn()
  }
}
global.tailwind = {
  config: {}
}
