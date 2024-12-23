export class OpenAIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OpenAIError'
  }
}
