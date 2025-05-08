import registerUser from '@sx/auth/oauth/service-worker/registration'
import IpcRequest, { IpcRequestSendEvent } from '@sx/types/ipc-request'

// Mock chrome.runtime.onMessage.addListener
global.chrome = {
  ...global.chrome,
  runtime: {
    ...global.chrome.runtime,
    onMessage: {
      ...global.chrome.runtime.onMessage,
      addListener: jest.fn()
    },
  }
}

// Mock registerUser
jest.mock('@sx/auth/oauth/service-worker/registration', () => jest.fn())

describe('listener', () => {
  let addListenerCallback: (request: IpcRequest) => void

  beforeAll(async () => {
    await import('@sx/auth/oauth/service-worker/listener')
    const addListenerSpy = global.chrome.runtime.onMessage.addListener as jest.Mock
    addListenerCallback = addListenerSpy.mock.calls[0][0] as (request: IpcRequest) => void
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should call registerUser when action is saveUserToken', () => {
    const request = {
      action: 'saveUserToken',
      data: {
        googleToken: 'test-token',
        shortcutToken: 'test-shortcut-token'
      }
    } as IpcRequest

    addListenerCallback(request)

    expect(registerUser).toHaveBeenCalledWith('test-token', 'test-shortcut-token')
  })

  it('should not call registerUser when action is not saveUserToken', () => {
    const request = {
      action: 'sendEvent',
      data: {
        eventName: 'test-token'
      }
    } as IpcRequestSendEvent

    addListenerCallback(request)

    expect(registerUser).not.toHaveBeenCalled()
  })
})
