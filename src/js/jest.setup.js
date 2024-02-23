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
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn()
        }
    },
    storage: {
        local: {
            set: jest.fn().mockResolvedValue({})
        },
        sync: {
            set: jest.fn().mockResolvedValue({})
        }
    },
    tabs: {
        query: jest.fn((queryInfo, callback) => {
            callback([{url: 'http://example.com/story/12345'}])
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
