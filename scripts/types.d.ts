declare module 'dotenv' {
  function config(): void
  function parse(src: Buffer): Record<string, string>

  export default {
    config,
    parse
  }
}
