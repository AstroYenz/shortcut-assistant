import { SlugManager } from '../slug-manager'


/**
 * Redirects the user from the omnibox based on the provided text and disposition.
 * If the text is a number, it redirects to the corresponding Shortcut story.
 * If the text is not a number, it performs a search in Shortcut.
 *
 * @param {string} text - The text entered in the omnibox.
 * @param {string} disposition - The desired disposition of the redirection.
 *    Possible values are 'currentTab', 'newForegroundTab', and 'newBackgroundTab'.
 *
 * @return {void}
 */
export async function redirectFromOmnibox(text: string, disposition: 'currentTab' | 'newForegroundTab' | 'newBackgroundTab'): Promise<void> {
  let url
  // Redirect to exact story if text is a number
  if (!isNaN(Number(text))) {
    const companySlug = await SlugManager.getCompanySlug()
    if (companySlug) {
      url = `https://app.shortcut.com/${companySlug}/story/${text}`
    }
    else {
      url = `https://app.shortcut.com/search#${encodeURIComponent(text)}`
    }
  }
  else {
    url = `https://app.shortcut.com/search#${encodeURIComponent(text)}`
  }

  switch (disposition) {
  case 'currentTab':
    await chrome.tabs.update({ url })
    break
  case 'newForegroundTab':
    await chrome.tabs.create({ url })
    break
  case 'newBackgroundTab':
    await chrome.tabs.create({ url, active: false })
    break
  default:
    await chrome.tabs.update({ url })
    break
  }
}

export async function setOmniboxSuggestion(text: string): Promise<void> {
  if (!isNaN(Number(text))) {
    const companySlug = await SlugManager.getCompanySlug()
    if (companySlug) {
      chrome.omnibox.setDefaultSuggestion({ description: `Open story sc-${text}` })
      return
    }
  }
  chrome.omnibox.setDefaultSuggestion({ description: `Search shortcut for ${text}` })
}
