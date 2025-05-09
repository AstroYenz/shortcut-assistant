import changeIteration from '@sx/keyboard-shortcuts/change-iteration'


interface MockedButtonElement extends HTMLElement {
  click: jest.Mock
}

interface MockedInputElement extends HTMLElement {
  focus: jest.Mock
  value: string
}

interface MockedSelectElement extends HTMLElement {
  querySelector: jest.Mock
  click: jest.Mock
}

describe('change iteration', () => {
  it('should send an event to the background script', async () => {
    chrome.runtime.sendMessage = jest.fn()
    await changeIteration()
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'sendEvent', data: { eventName: 'change_iteration' } })
  })

  it('should open the iteration dropdown', async () => {
    const mockChildButton = { click: jest.fn() } as MockedButtonElement
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    } as MockedSelectElement

    const mockInput = { focus: jest.fn(), value: '' } as MockedInputElement
    const mockedIterationPopup = { querySelector: jest.fn().mockReturnValue(mockInput) } as MockedSelectElement

    jest.spyOn(document, 'querySelector').mockImplementation((selector): Element | null => {
      if (selector === '[data-perma-id="iteration-select"]') {
        return mockedIterationSelect
      }
      else if (selector === '.iteration-selector') {
        return mockedIterationPopup
      }
      return null
    })

    await changeIteration()

    expect(mockedIterationSelect.querySelector).toHaveBeenCalledWith('[role="button"]')
    expect(mockChildButton.click).toHaveBeenCalled()
    expect(mockedIterationSelect.click).toHaveBeenCalled()
    expect(mockedIterationPopup.querySelector).toHaveBeenCalledWith('.autocomplete-input')
    expect(mockInput.focus).toHaveBeenCalled()
  })

  it('should error to console if no input select is found in changeIteration function', async () => {
    const mockChildButton = { click: jest.fn() }
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(null)
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    }

    await changeIteration()

    expect(mockedIterationSelect.querySelector).not.toHaveBeenCalledWith('[role="button"]')
    expect(mockChildButton.click).not.toHaveBeenCalled()
    expect(mockedIterationSelect.click).not.toHaveBeenCalled()
  })

  it('should error to console if no input is found in changeIteration function', async () => {
    const mockChildButton = { click: jest.fn() } as MockedButtonElement
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    } as MockedSelectElement
    const mockInput = { focus: jest.fn(), value: '' } as MockedInputElement
    const mockedIterationPopup = { querySelector: jest.fn().mockReturnValue(null) } as MockedSelectElement

    jest.spyOn(document, 'querySelector').mockImplementation((selector): HTMLElement | null => {
      if (selector === '[data-perma-id="iteration-select"]') {
        return mockedIterationSelect
      }
      else if (selector === '.iteration-selector') {
        return mockedIterationPopup
      }
      return null
    })

    await changeIteration()

    expect(mockedIterationSelect.querySelector).toHaveBeenCalledWith('[role="button"]')
    expect(mockChildButton.click).toHaveBeenCalled()
    expect(mockedIterationSelect.click).toHaveBeenCalled()
    expect(mockedIterationPopup.querySelector).toHaveBeenCalledWith('.autocomplete-input')
    expect(mockInput.focus).not.toHaveBeenCalled()
  })

  it.skip('changeIteration function with no childButton', async () => {
    const mockChildButton = null
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    } as MockedSelectElement
    const mockInput = { focus: jest.fn(), value: '' } as MockedInputElement
    const mockedIterationPopup = { querySelector: jest.fn().mockReturnValue(mockInput) } as MockedSelectElement

    jest.spyOn(document, 'querySelector').mockImplementation((selector): HTMLElement | null => {
      if (selector === '[data-perma-id="iteration-select"]') {
        return mockedIterationSelect
      }
      else if (selector === '.iteration-selector') {
        return mockedIterationPopup
      }
      return null
    })

    await changeIteration()

    expect(mockedIterationSelect.querySelector).toHaveBeenCalledWith('[role="button"]')
    expect(mockedIterationSelect.click).not.toHaveBeenCalled()
    expect(mockedIterationPopup.querySelector).not.toHaveBeenCalled()
    expect(mockInput.focus).not.toHaveBeenCalled()
  })

  it.skip('changeIteration function with no popup', async () => {
    const mockChildButton = { click: jest.fn() } as MockedButtonElement
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    } as MockedSelectElement
    const mockInput = { focus: jest.fn(), value: '' } as MockedInputElement
    const mockedIterationPopup = null

    jest.spyOn(document, 'querySelector').mockImplementation((selector): HTMLElement | null => {
      if (selector === '[data-perma-id="iteration-select"]') {
        return mockedIterationSelect
      }
      else if (selector === '.iteration-selector') {
        return mockedIterationPopup
      }
      return null
    })

    await changeIteration()

    expect(mockedIterationSelect.querySelector).toHaveBeenCalledWith('[role="button"]')
    expect(mockChildButton.click).toHaveBeenCalled()
    expect(mockedIterationSelect.click).toHaveBeenCalled()
    expect(mockInput.focus).not.toHaveBeenCalled()
  })
})
