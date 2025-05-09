import { KeyboardShortcuts } from '@sx/keyboard-shortcuts/keyboard-shortcuts'


jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(undefined))

describe('Shortcuts', () => {
  beforeEach(() => {
    document.getElementById = jest.fn()
    document.querySelector = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should add keydown event listener on activate', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const keyboardShortcuts = new KeyboardShortcuts()

    keyboardShortcuts.activate()

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addEventListenerSpy.mockRestore()
  })

  it('should add keydown event listener to document', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const keyboardShortcuts = new KeyboardShortcuts()

    keyboardShortcuts.activate()

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addEventListenerSpy.mockRestore()
  })

  it.each([
    // Define test cases as [input, expectedOutput]
    [{ key: 'A', shiftKey: false }, 'a-0-0-0-0'],
    [{ key: 'B', shiftKey: true, metaKey: true, altKey: true, ctrlKey: true }, 'b-1-1-1-1'],
    [{ key: 'C', shiftKey: true, ctrlKey: true }, 'c-0-1-0-1'],
    [{ key: 'd', metaKey: true, shiftKey: false }, 'd-1-0-0-0'],
    [{ key: 'e', altKey: true, shiftKey: true }, 'e-0-1-1-0']
  ])('serializes shortcut %o to "%s"', (input, expectedOutput) => {
    const keyboardShortcuts = new KeyboardShortcuts()
    const serialized = keyboardShortcuts.serializeShortcut(input)
    expect(serialized).toBe(expectedOutput)
  })

  it('adds a shortcut to the shortcuts map', () => {
    const keyboardShortcuts = new KeyboardShortcuts()
    const mockFunction = jest.fn()

    const shortcut = {
      key: 'n',
      shiftKey: true,
      ctrlKey: true,
      func: mockFunction
    }

    const expectedSerializedKey = 'n-0-1-0-1'

    keyboardShortcuts.registerShortcut(shortcut)

    expect(keyboardShortcuts.shortcuts.has(expectedSerializedKey)).toBeTruthy()

    // Further, verify that the function mapped to the serialized key is indeed the mockFunction,
    // considering it's bound to the KeyboardShortcuts instance, we directly compare the reference here
    const registeredFunction: (() => Promise<void>) | undefined = keyboardShortcuts.shortcuts.get(expectedSerializedKey)
    expect(registeredFunction).toBeDefined()

    // Since we cannot directly compare bound functions, we'll invoke it and check if the mock was called
    registeredFunction?.()
    expect(mockFunction).toHaveBeenCalled()
  })

  describe('KeyboardShortcuts class', () => {
    let keyboardShortcuts: KeyboardShortcuts
    let mockFunction: jest.MockedFn<jest.MockableFunction>

    beforeEach(() => {
      keyboardShortcuts = new KeyboardShortcuts()
      mockFunction = jest.fn()
      mockFunction.mockResolvedValue(undefined) // Simulate a function that returns a promise
    })

    it('calls the registered function for a matching keydown event', async () => {
      chrome.runtime.sendMessage = jest.fn()
      const shortcut = {
        key: 'n',
        shiftKey: true,
        ctrlKey: true,
        func: mockFunction
      }

      keyboardShortcuts.registerShortcut(shortcut)
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        shiftKey: true,
        ctrlKey: true
      })

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      await keyboardShortcuts.handleKeyDown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockFunction).toHaveBeenCalled()
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'sendEvent', data: { eventName: 'keyboard-shortcut', params: { shortcutAction: 'bound mock_constructor' } } })
    })

    it('does not call preventDefault or a function for a non-matching keydown event', async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'm',
        shiftKey: false,
        ctrlKey: false
      })

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      await keyboardShortcuts.handleKeyDown(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
      // Since no function is registered for this key, the mock function should not be called
      expect(mockFunction).not.toHaveBeenCalled()
    })

    it('logs an error if the called function throws an error', async () => {
      const error = new Error('error')
      mockFunction.mockRejectedValue(error)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const shortcut = {
        key: 'n',
        shiftKey: true,
        ctrlKey: true,
        func: mockFunction
      }

      keyboardShortcuts.registerShortcut(shortcut)
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        shiftKey: true,
        ctrlKey: true
      })

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      await keyboardShortcuts.handleKeyDown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockFunction).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error running shortcut:', error)
    })
  })
})
