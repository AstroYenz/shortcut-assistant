import {
  findFirstMatchingElementForState
} from '@sx/development-time/find-first-matching-element-for-state'


global.chrome = {
  ...global.chrome,
  runtime: {
    ...global.chrome.runtime,
    onMessage: {
      ...global.chrome.runtime.onMessage,
      addListener: jest.fn()
    }
  },
  tabs: {
    ...global.chrome.tabs,
    query: jest.fn()
  }
}


describe('findFirstMatchingElementForState', (): void => {
  let mockElement: { children: { innerHTML: string }[] }

  beforeEach(() => {
    // Mocking the document.querySelectorAll method
    document.querySelectorAll = jest.fn()
    mockElement = {
      children: [
        { innerHTML: 'In Development' },
        { innerHTML: 'In Production' },
      ]
    }
  })

  it('returns the first element and its child that matches the state', () => {
    (document.querySelectorAll as jest.Mock).mockReturnValue([mockElement])
    const result = findFirstMatchingElementForState('In Development')
    expect(result).toEqual({ element: mockElement, child: mockElement.children[0] })
  })

  it('returns null if no element matches the state', () => {
    (document.querySelectorAll as jest.Mock).mockReturnValue([mockElement])
    const result = findFirstMatchingElementForState('Nonexistent State')
    expect(result).toBeNull()
  })
})
