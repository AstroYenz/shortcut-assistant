export default function sleep(ms: number): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout(resolve, ms)
  })
}
