#!/usr/bin/env node

/**
 * Script to update the VERSION in the .env file.
 * This is used as part of the "yarn version" lifecycle.
 */

import fs, { readFileSync } from 'fs'
import path from 'path'

import dotenv from 'dotenv'

/**
 * Updates the VERSION in the .env file
 */
function updateEnvFile(): void {
  // Get version from package.json
  const packageJsonPath = path.resolve(process.cwd(), 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const newVersion = packageJson.version

  if (!newVersion) {
    process.stderr.write('ERROR: Could not find version in package.json\n')
    process.exit(1)
  }

  process.stdout.write(`Updating .env with version ${newVersion}\n`)

  const envPath = path.resolve(process.cwd(), '.env')

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    process.stdout.write('No .env file found. Creating one...\n')
    fs.writeFileSync(envPath, `VERSION=${newVersion}\n`)
    return
  }

  // Load existing .env file
  const envConfig = dotenv.parse(fs.readFileSync(envPath))

  // Update or add VERSION
  envConfig.VERSION = newVersion

  // Write back to .env
  const newEnvContent = Object.entries(envConfig)
    .map(([key, value]: [string, string]) => `${key}=${value}`)
    .join('\n')

  fs.writeFileSync(envPath, newEnvContent + '\n')
  process.stdout.write(`Updated VERSION in .env to ${newVersion}\n`)
}

// Run the update
updateEnvFile()
