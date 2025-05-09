jest.mock('@sx/popup/popup', () => {
  return {
    Popup: jest.fn().mockImplementation(() => {})
  }
})

import { Popup } from '@sx/popup/popup'


describe('Popup Initializer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should add DOM event listener', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    require('@sx/popup/initializer')
    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function))
  })

  it('should instantiate Popup class on DOM content loaded', () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        // @ts-expect-error - TS doesn't know about the mock implementation
        if (typeof callback === 'function') callback()
      }
    })
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(Popup).toHaveBeenCalled()
  })
})
