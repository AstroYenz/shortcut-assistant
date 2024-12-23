import {
  redirectFromOmnibox,
  setOmniboxSuggestion
} from '../../../.old_src/js/service-worker/omnibox/omnibox'
import {SlugManager} from '../../../.old_src/js/service-worker/slug-manager'


global.chrome = {
  tabs: {
    update: jest.fn(),
    create: jest.fn()
  },
  omnibox: {
    setDefaultSuggestion: jest.fn()
  }
}


describe('redirectFromOmnibox', () => {

  beforeEach(() => {
    global.chrome.tabs.update.mockClear()
    global.chrome.tabs.create.mockClear()
  })

  it('should update the current tab with the given URL if one is provided', () => {
    const disposition = 'currentTab'
    const text = '123'
    const expectedUrl = 'https://app.shortcut.com/test/story/123'
    SlugManager.getCompanySlug.mockResolvedValue('test')
    redirectFromOmnibox(text, disposition).then(() => {
      expect(chrome.tabs.update).toHaveBeenCalledWith({url: expectedUrl})
    })
  })

  it('should update the current tab with the correct URL when the disposition is currentTab', () => {
    const text = 'test'
    const disposition = 'currentTab'

    const expectedUrl = {url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`}

    redirectFromOmnibox(text, disposition).then(() => {
      expect(chrome.tabs.update).toHaveBeenCalledWith(expectedUrl)
    })
  })

  it('should create a new foreground tab with the correct URL when the disposition is newForegroundTab', () => {
    const text = 'test'
    const disposition = 'newForegroundTab'

    const expectedUrl = {url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`}

    redirectFromOmnibox(text, disposition).then(() => {
      expect(global.chrome.tabs.create).toHaveBeenCalledWith(expectedUrl)
    })
  })

  it('should create a new background tab with the correct URL when the disposition is newBackgroundTab', () => {
    const text = 'test'
    const disposition = 'newBackgroundTab'

    const expectedUrl = {
      url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`,
      active: false
    }

    redirectFromOmnibox(text, disposition).then(() => {
      expect(global.chrome.tabs.create).toHaveBeenCalledWith(expectedUrl)
    })
  })

  it('should update the tab with the correct url when the disposition is unknown', () => {
    const text = 'test'
    const disposition = 'unknown'

    const expectedUrl = {url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`}

    redirectFromOmnibox(text, disposition).then(() => {
      expect(global.chrome.tabs.update).toHaveBeenCalledWith(expectedUrl)
    })
  })
})

describe('setOmniboxSuggestion', () => {
  beforeEach(() => {
    global.chrome.omnibox.setDefaultSuggestion.mockClear()
    jest.spyOn(SlugManager, 'getCompanySlug').mockResolvedValue('test')
  })

  it('should set the default suggestion to open the story when a number is provided', async () => {
    const text = '123'
    const companySlug = 'test'
    const expectedSuggestion = {description: `Open story sc-${text}`}

    SlugManager.getCompanySlug.mockResolvedValue(companySlug)

    await setOmniboxSuggestion(text)
    expect(chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledWith(expectedSuggestion)
  })
  jest.spyOn(SlugManager, 'getCompanySlug').mockResolvedValue('')

  it('should set the default suggestion to search for the text when a string is provided', async () => {
    const text = 'test'
    const companySlug = ''
    const expectedSuggestion = {description: `Search shortcut for ${text}`}

    SlugManager.getCompanySlug.mockResolvedValue(companySlug)

    await setOmniboxSuggestion(text)
    expect(chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledWith(expectedSuggestion)
  })
})
