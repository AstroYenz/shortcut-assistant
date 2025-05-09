import checkHost from '@sx/utils/check-host'


describe('check host', () => {
  it('should return true if the host is app.shortcut.com', () => {
    expect(checkHost('https://app.shortcut.com')).toBe(true)
  })

  it('should return false if the host is not app.shortcut.com', () => {
    expect(checkHost('https://google.com')).toBe(false)
  })

  it('should return false if the host is not app.shortcut.com even if the path is app.shortcut.com', () => {
    expect(checkHost('https://google.com/app.shortcut.com')).toBe(false)
  })
})
