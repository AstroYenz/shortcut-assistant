import fs from 'fs'

import { config } from 'dotenv'


config()


const manifestTemplate = fs.readFileSync('.old_src/manifest.template.json', 'utf8')
const version = process.env.VERSION
if (!version) {
  throw new Error('No version provided')
}
// Replace any value beginning and ending with double underscores with the value from the environment

const manifest = manifestTemplate.replace(/__([A-Z0-9_]+)__/g, (match, placeholder: string) => {
  const envValue = process.env[placeholder]
  if (!envValue) {
    throw new Error(`No value provided for ${placeholder}`)
  }
  return envValue
})

fs.writeFileSync('.old_src/manifest.json', manifest)
