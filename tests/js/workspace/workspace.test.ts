import dayjs from 'dayjs'

import { logError } from '@sx/utils/log-error'
import Workspace from '@sx/workspace/workspace'


jest.mock('@sx/utils/log-error')
jest.mock('@sx/utils/get-states', () => ({
  __esModule: true, // This property tells Jest that we're mocking an ES module
  default: jest.fn().mockResolvedValue({
    Backlog: [],
    Unstarted: [],
    Started: [],
    Done: []
  }), // Mock the default export, which is the _getStates function
  ShortcutWorkflowStates: jest.requireActual('@sx/utils/get-states').ShortcutWorkflowStates // Optionally export actual types or constants if needed
}))

global.chrome = {
  ...global.chrome,
  action: {
    ...global.chrome.action,
    getBadgeText: jest.fn().mockResolvedValue(() => Promise.resolve('New!')),
  },
  storage: {
    ...chrome.storage,
    local: {
      ...chrome.storage.local,
      get: jest.fn(),
      set: jest.fn(),
    },
  },
}

const states = { Backlog: [], Unstarted: [], Started: [], Done: [] }


describe('Workspace', () => {
  it('should get states on activation', async () => {
    jest.spyOn(Workspace, 'states').mockResolvedValue(states)
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
    await Workspace.activate()
    expect(Workspace.states).toHaveBeenCalled()
  })

  it('should log error if states cannot be fetched', async () => {
    jest.spyOn(Workspace, 'states').mockRejectedValue(new Error('Failed to fetch states'))
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
    await Workspace.activate()
    expect(logError).toHaveBeenCalled()
  })

  it('should get states from storage', async () => {
    const getStorageSpy = jest.spyOn(chrome.storage.local, 'get')
    getStorageSpy.mockImplementation((key, callback) => {
      if (typeof callback !== 'function') {
        return { states, stateRefreshDate: '2021-05-01' }
      }
      callback({ states, stateRefreshDate: '2021-05-01' })
    })
    const result = await Workspace.states()
    expect(result).toEqual(states)
  })

  it('should return null if states are not in storage and fetch is false', async () => {
    const getStorageSpy = jest.spyOn(chrome.storage.local, 'get')
    getStorageSpy.mockImplementation((key, callback) => {
      if (typeof callback !== 'function') {
        return states
      }
      callback(states)
    })
    const result = await Workspace.states(false)
    expect(result).toBeNull()
  })

  it('should fetch states if they are not in storage', async () => {
    const states = { Backlog: [], Unstarted: [], Started: [], Done: [] }
    const getStorageSpy = jest.spyOn(chrome.storage.local, 'get')
    const setStorageSpy = jest.spyOn(chrome.storage.local, 'set')
    getStorageSpy.mockImplementation((key, callback) => {
      if (typeof callback !== 'function') {
        return { states: states, stateRefreshDate: dayjs().add(1, 'day').format() }
      }
      callback({ states: states, stateRefreshDate: dayjs().add(1, 'day').format() })
    })
    const result = await Workspace.states(true)
    expect(result).toEqual(states)
    expect(setStorageSpy).toHaveBeenCalledWith({ states, stateRefreshDate: dayjs().add(1, 'week').format() })
  })
})
