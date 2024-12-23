import changeState from '../../.old_src/js/keyboard-shortcuts/change-state'


jest.mock('../../.old_src/js/utils/sleep', () => jest.fn().mockResolvedValue(undefined))

interface MockedButtonElement extends HTMLElement {
  click: jest.Mock;
}

interface MockedInputElement extends HTMLElement {
  focus: jest.Mock;
  value: string;
}

interface MockedSelectElement extends HTMLElement {
  querySelector: jest.Mock;
  click: jest.Mock;
}

describe('change state', () => {
  let mockedDropdown: MockedButtonElement

  beforeEach(() => {
    mockedDropdown = {click: jest.fn()} as MockedButtonElement
    const mockedDropdownParent = {querySelector: jest.fn().mockReturnValue(mockedDropdown)} as MockedSelectElement
    jest.spyOn(document, 'getElementById').mockReturnValueOnce(mockedDropdownParent)
  })

  it('should send an event to the background script', async () => {
    chrome.runtime.sendMessage = jest.fn()
    await changeState()
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({action: 'sendEvent', data: {eventName: 'change_state'}})
  })

  it('should open dropdown when called', async () => {
    const mockedPopup = {} as MockedSelectElement
    const mockedInput = {
      focus: jest.fn(),
      set value(_: unknown) {
      }
    } as MockedInputElement

    const mockedInputParent = {querySelector: jest.fn().mockReturnValue(mockedInput)} as MockedSelectElement
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(mockedPopup).mockReturnValueOnce(mockedInputParent)

    await changeState()

    expect(mockedDropdown.click).toHaveBeenCalled()
    expect(mockedInput.focus).toHaveBeenCalled()
  })

  it('changeState function with no dropdown', async () => {

    jest.spyOn(document, 'getElementById').mockReturnValueOnce(null)

    await changeState()
    expect(document.getElementById).toHaveBeenCalledWith('story-dialog-state-dropdown')
  })

  it.skip('should log error to console if no popup is found in changeState function', async () => {
    console.error = jest.fn()
    const mockedPopup = {querySelector: jest.fn().mockReturnValue(null)}


    jest.spyOn(document, 'querySelector').mockReturnValueOnce(null)

    changeState()

    expect(mockedDropdown.click).toHaveBeenCalled()
    expect(mockedPopup.querySelector).not.toHaveBeenCalled()
  })

  it.skip('changeState function with no input', async () => {
    const mockedPopup = {querySelector: jest.fn()} as MockedSelectElement
    const mockedInput = null


    jest.spyOn(document, 'querySelector').mockReturnValueOnce(mockedPopup)

    mockedPopup.querySelector.mockReturnValue(mockedInput)

    changeState()

    expect(mockedDropdown.click).toHaveBeenCalled()
    expect(mockedPopup.querySelector).toHaveBeenCalled()
  })

})
