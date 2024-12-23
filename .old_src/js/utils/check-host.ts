function checkHost(url: string): boolean {
  const host = new URL(url).host
  return host === 'app.shortcut.com'
}

export default checkHost
