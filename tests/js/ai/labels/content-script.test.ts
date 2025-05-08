import LabelsContentScript from '@sx/ai/labels/content-script'


jest.mock('@sx/utils/story', () => ({
  Story: {
    isReady: jest.fn(),
  },
}))

global.chrome = {
  ...chrome,
  action: {
    ...chrome.action,
    openPopup: jest.fn(),
  },
  storage: {
    ...chrome.storage,
    local: {
      ...chrome.storage.local,
      get: jest.fn(),
    },
  },
}

describe('LabelsContentScript', () => {
  it('should open popup if not authenticated', async () => {
    const openPopupSpy = jest.spyOn(chrome.action, 'openPopup')
    const isAuthenticatedSpy = jest.spyOn(LabelsContentScript, 'isAuthenticated').mockResolvedValue(false)

    await LabelsContentScript.onClick()

    expect(openPopupSpy).toHaveBeenCalled()
    openPopupSpy.mockRestore()
    isAuthenticatedSpy.mockRestore()
  })

  it('should throw error if button not found', async () => {
    const fakeButton = null
    document.querySelector = jest.fn().mockReturnValue(fakeButton)
    jest.spyOn(LabelsContentScript, 'isAuthenticated').mockResolvedValue(true)

    await expect(LabelsContentScript.onClick).rejects.toThrow('Could not find button')
  })

  it('should send message if authenticated', async () => {
    const sendMessageSpy = jest.spyOn(chrome.runtime, 'sendMessage')
    const isAuthenticatedSpy = jest.spyOn(LabelsContentScript, 'isAuthenticated').mockResolvedValue(true)
    const fakeButton = document.createElement('button')
    fakeButton.textContent = 'Auto Add'
    fakeButton.dataset.assistant = 'add-labels'
    document.querySelector = jest.fn().mockReturnValue(fakeButton)
    await LabelsContentScript.onClick()

    expect(sendMessageSpy).toHaveBeenCalledWith({ action: 'addLabels' })
    sendMessageSpy.mockRestore()
    isAuthenticatedSpy.mockRestore()
  })

  it('should return true if authenticated', async () => {
    const storage = { backendKey: 'key' }
    chrome.storage.local.get = jest.fn().mockResolvedValue(storage)
    const result = await LabelsContentScript.isAuthenticated()
    expect(result).toBeTruthy()
  })

  it('should return false if not authenticated', async () => {
    const storage = {}
    chrome.storage.local.get = jest.fn().mockResolvedValue(storage)
    const result = await LabelsContentScript.isAuthenticated()
    expect(result).toBeFalsy()
  })

  it('should throw error if parent of add label button not found', async () => {
    const fakeButton = { parentElement: null }
    document.querySelector = jest.fn().mockReturnValue(fakeButton)

    await expect(LabelsContentScript.addButton).rejects.toThrow('Could not find parent of add label button')
  })

  it('should add button', async () => {
    const createButtonSpy = jest.spyOn(LabelsContentScript, 'createButton').mockResolvedValue(document.createElement('button'))
    const addButton = document.createElement('div')
    addButton.id = 'story-dialog-add-label-dropdown'
    const fakeDiv = { parentElement: addButton }
    document.querySelector = jest.fn().mockReturnValue(fakeDiv)

    await LabelsContentScript.addButton()

    expect(addButton.children.length).toBe(1)
    createButtonSpy.mockRestore()
  })

  it('should create button', async () => {
    const isAuthenticatedSpy = jest.spyOn(LabelsContentScript, 'isAuthenticated').mockResolvedValue(true)
    const button = await LabelsContentScript.createButton()
    expect(button.className).toBe('add-labels action micro')
    expect(button.dataset.assistant).toBe('add-labels')
    expect(button.style.marginTop).toBe('5px')
    expect(button.dataset.tooltip).toBe('Use AI to add relevant labels')
    expect(button.textContent).toBe('Auto Add Labels...')
    isAuthenticatedSpy.mockRestore()
  })

  it('should not add button if feature is disabled', async () => {
    process.env.NEW_AI_FEATURES_ENABLED = 'false'
    const addButtonSpy = jest.spyOn(LabelsContentScript, 'addButton')

    await LabelsContentScript.init()

    expect(addButtonSpy).not.toHaveBeenCalled()
    addButtonSpy.mockRestore()
  })

  it('should add button if feature is enabled', async () => {
    process.env.NEW_AI_FEATURES_ENABLED = 'true'
    const addButtonSpy = jest.spyOn(LabelsContentScript, 'addButton')

    await LabelsContentScript.init()

    expect(addButtonSpy).toHaveBeenCalled()
    addButtonSpy.mockRestore()
  })
})
