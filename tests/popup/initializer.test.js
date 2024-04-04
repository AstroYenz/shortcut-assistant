jest.mock('../../src/js/popup/popup', () => {
  return {
    Popup: jest.fn().mockImplementation(() => {
      console.log('Popup initialized')
    })
  }
})

import {Popup} from '../../src/js/popup/popup'


describe('Popup Initializer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should add DOM event listener', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    require('../../src/js/popup/initializer')
    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function))
  })

  it('should instantiate Popup class on DOM content loaded', () => {
    // Mock event listener being called
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback()
      }
    })
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(Popup).toHaveBeenCalled()
  })
})
