import {
  redirectFromOmnibox,
  setOmniboxSuggestion
} from '@sx/service-worker/omnibox/omnibox'
import { SlugManager } from '@sx/service-worker/slug-manager'


// No need to redefine chrome mock here, it's coming from jest.chromeSetup.js

describe('redirectFromOmnibox', () => {
  beforeEach(() => {
    global.chrome.tabs.update.mockClear()
    global.chrome.tabs.create.mockClear()
  })

  it('should update the current tab with the given URL if one is provided', async () => {
    const disposition = 'currentTab'
    const text = '123'
    const expectedUrl = 'https://app.shortcut.com/test/story/123'
    SlugManager.getCompanySlug.mockResolvedValue('test')
    await redirectFromOmnibox(text, disposition)
    expect(chrome.tabs.update).toHaveBeenCalledWith({ url: expectedUrl })
  })

  it('should update the current tab with the correct URL when the disposition is currentTab', () => {
    const text = 'test'
    const disposition = 'currentTab'

    const expectedUrl = { url: `https://app.shortcut.com/search#${encodeURIComponent(text)}` }

    // eslint-disable-next-line jest/valid-expect-in-promise
    redirectFromOmnibox(text, disposition).then(() => {
      expect(chrome.tabs.update).toHaveBeenCalledWith(expectedUrl)
    })
  })

  it('should create a new foreground tab with the correct URL when the disposition is newForegroundTab', () => {
    const text = 'test'
    const disposition = 'newForegroundTab'

    const expectedUrl = { url: `https://app.shortcut.com/search#${encodeURIComponent(text)}` }

    // eslint-disable-next-line jest/valid-expect-in-promise
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

    // eslint-disable-next-line jest/valid-expect-in-promise
    redirectFromOmnibox(text, disposition).then(() => {
      expect(global.chrome.tabs.create).toHaveBeenCalledWith(expectedUrl)
    })
  })

  it('should update the tab with the correct url when the disposition is unknown', () => {
    const text = 'test'
    const disposition = 'unknown'

    const expectedUrl = { url: `https://app.shortcut.com/search#${encodeURIComponent(text)}` }

    // eslint-disable-next-line jest/valid-expect-in-promise
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
    const expectedSuggestion = { description: `Open story sc-${text}` }

    SlugManager.getCompanySlug.mockResolvedValue(companySlug)

    await setOmniboxSuggestion(text)
    expect(chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledWith(expectedSuggestion)
  })
  jest.spyOn(SlugManager, 'getCompanySlug').mockResolvedValue('')

  it('should set the default suggestion to search for the text when a string is provided', async () => {
    const text = 'test'
    const companySlug = ''
    const expectedSuggestion = { description: `Search shortcut for ${text}` }

    SlugManager.getCompanySlug.mockResolvedValue(companySlug)

    await setOmniboxSuggestion(text)
    expect(chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledWith(expectedSuggestion)
  })
})
