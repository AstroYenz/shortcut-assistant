#!/usr/bin/env node

/**
 * Script to update the version number in both package.json and .env,
 * then run the build process.
 *
 * Usage: yarn version-up <major|minor|patch>
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'

/**
 * Type for allowed commands to prevent command injection
 */
type AllowedCommand =
  | `yarn version --${'major' | 'minor' | 'patch'} --no-git-tag-version`
  | 'yarn build'

/**
 * Runs a command in the shell and returns the output
 * @param {AllowedCommand} command - The command to run (restricted to safe predefined commands)
 * @returns {string} The output of the command
 * @throws {Error} If the command fails to execute
 */
function runCommand(command: AllowedCommand): string {
  try {
    return execSync(command, { encoding: 'utf8' }).trim()
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    process.stderr.write(`Error executing command: ${command}\n`)
    process.stderr.write(`${errorMessage}\n`)
    throw new Error(`Command failed: ${command}\n${errorMessage}`)
  }
}

/**
 * Updates the VERSION in the .env file
 * @param {string} newVersion - The new version number
 */
function updateEnvFile(newVersion: string): void {
  // Remove 'v' prefix if it exists
  newVersion = newVersion.startsWith('v') ? newVersion.substring(1) : newVersion

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

/**
 * Main function to run the version update process
 */
function main(): void {
  // Check if version type is provided
  const versionType = process.argv[2]
  if (!versionType || !['major', 'minor', 'patch'].includes(versionType)) {
    process.stderr.write('Please specify version type: major, minor, or patch\n')
    process.exit(1)
  }

  process.stdout.write(`Updating version (${versionType})...\n`)

  // Run yarn version to update package.json
  const result = runCommand(`yarn version --${versionType} --no-git-tag-version` as AllowedCommand)

  // Extract new version from yarn output
  const versionMatch = result.match(/New version: (.+)$/m)
  if (!versionMatch) {
    process.stderr.write('Failed to extract new version from yarn output\n')
    process.exit(1)
  }

  const newVersion = versionMatch[1]
  process.stdout.write(`Version updated to ${newVersion} in package.json\n`)

  // Update .env file with new version
  updateEnvFile(newVersion)

  // Run build process
  process.stdout.write('Running build process...\n')
  try {
    runCommand('yarn build')

    // Only show success message if build completes without errors
    process.stdout.write(`
✅ Version update complete!
- package.json updated to ${newVersion}
- .env updated with VERSION=${newVersion}
- Build completed

Next steps:
1. Commit the changes: git commit -am "Bump version to ${newVersion}"
2. Tag the release: git tag v${newVersion}
3. Push changes: git push && git push --tags
`)
  }
  catch (error) {
    // The build failed, so we show an error message instead
    const errorMessage = error instanceof Error ? error.message : String(error)
    process.stderr.write(`❌ Build process failed!\n${errorMessage}\n`)
    process.stderr.write(`
Version numbers were updated but the build failed:
- package.json updated to ${newVersion}
- .env updated with VERSION=${newVersion}

Please fix the build issues before proceeding.
`)
    process.exit(1)
  }
}

main()
