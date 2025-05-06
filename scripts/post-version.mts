#!/usr/bin/env node

/**
 * Script to run after version update.
 * This is used as part of the "yarn version" lifecycle.
 */

import { readFileSync } from 'fs'
import path from 'path'


function postVersionActions(): void {
  // Get version from package.json
  const packageJsonPath = path.resolve(process.cwd(), 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const version = packageJson.version

  process.stdout.write(`
✅ Version update complete!

Version updated to ${version}
- package.json updated
- .env updated with VERSION=${version}
- Build completed

Next steps:
1. Commit the changes: git commit -am "Bump version to ${version}"
2. Tag the release: git tag v${version}
3. Push changes: git push && git push --tags
`)
}

// Run post-version actions
postVersionActions()
