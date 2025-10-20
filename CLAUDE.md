# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shortcut Assistant is a Chrome extension that enhances the Shortcut project management platform with additional features including keyboard shortcuts, AI-powered story analysis, cycle time tracking, development time tracking, and integrations with external services.

## Essential Commands

### Development
```bash
npm run dev              # Build extension in watch mode for development
npm run build           # Build production bundle (also updates manifest)
npm run dist            # Create production build and generate dist.zip
```

### Testing
```bash
npm test                              # Run all tests
npm test -- path/to/test.test.tsx    # Run a single test file
npm run test-coverage                 # Run tests with coverage report
```

### Code Quality
```bash
npm run lint            # Lint TypeScript/React code
npm run lint-fix        # Auto-fix linting issues
```

### Versioning
Use yarn for version management:
```bash
yarn version --patch    # Bug fixes (1.0.0 -> 1.0.1)
yarn version --minor    # New features (1.0.0 -> 1.1.0)
yarn version --major    # Breaking changes (1.0.0 -> 2.0.0)
```

## Architecture

### Dual Codebase Structure

The project has two distinct codebases that serve different purposes:

1. **Legacy Vanilla JS/TS** (`src/js/`): Original extension functionality
   - Keyboard shortcuts, notes, Todoist integration
   - Content scripts for DOM manipulation
   - Service worker for background tasks
   - Analytics and OAuth handlers

2. **Modern React** (`src/react/`): New UI components and features
   - AI-powered story analysis with streaming
   - Settings drawer with authentication
   - FAB (Floating Action Button) UI
   - Component-based architecture

### Communication Bridge

The two systems communicate via `src/react/content-bridge.ts`:
- **Unified message routing**: All content script messages are routed through a single listener to prevent conflicts
- **Page-to-content messaging**: React page scripts communicate with content scripts via `window.postMessage`
- **Service worker integration**: Content scripts forward requests to service worker via `chrome.runtime.sendMessage`
- **AI streaming**: React-specific AI streaming system separate from legacy code

### Import Path Aliases

- `@sx/*` maps to `src/js/*` (legacy TypeScript code)
- `@/` maps to `src/react/*` (React components)
- Never use relative imports - always use these aliases

### Webpack Entry Points

- `js/contentScripts/bundle`: Main content scripts that run on Shortcut pages
- `js/service_worker/bundle`: Background service worker
- `js/popup/bundle`: Extension popup scripts
- `js/react/bundle`: React components and UI
- `js/analytics/bundle`: Analytics tracking

## Code Style

### General
- No default exports - use named exports at end of file
- Single quotes, no semicolons (enforced by ESLint)
- Stroustrup brace style
- 2-space indentation
- Explicit function return types required (`@typescript-eslint/explicit-function-return-type`)
- No loops - use functional patterns (`yenz/no-loops`)
- No magic numbers except -1 through 10

### Testing
- **Current tests**: Located in `tests/` directory, mirroring `src/` structure
  - Example: `src/app/page.tsx` → `tests/app/page.test.tsx`
- **Future convention**: Tests should be co-located with source files in `__tests__/` directories
  - Example: `src/app/page.tsx` → `src/app/__tests__/page.test.tsx`
  - **When adding or updating files, follow the new convention**
- Use AAA pattern (Arrange, Act, Assert)
- One describe block per function/class
- Place jest.mock() at top of file
- Create typed mocks: `const mockFn = jest.mocked(originalFn)` or `const mockFn = originalFn as jest.Mock`
- Global Chrome API mocks in `jest.chromeSetup.js`
- Prefer `.mockReturnValue()` over `.mockImplementation()` when possible
- Use `.toHaveBeenCalledWith()` over `.toHaveBeenCalled()` for assertions

### Import Ordering
Enforced by ESLint config:
1. Built-in Node modules
2. External dependencies
3. Internal modules (including `@sx/` paths)
4. Parent imports
5. Sibling imports
6. Index imports

Two blank lines after import block.

## Chrome Extension Development

### Local Testing
1. Build: `npm run dev`
2. Navigate to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select the `build/` folder
5. After changes to service worker or manifest, click "Reload" on the extension

### Environment Setup
Uses Doppler for secret management:
```bash
brew install doppler/tap/doppler-cli
doppler login
doppler setup --project shortcut-assistant --config dev
```

## Key Architecture Patterns

### Content Script Activation
Content scripts activate when:
1. User navigates to a Shortcut story page
2. URL contains both the Shortcut host and "story"
3. Service worker sends "update" message via `chrome.tabs.sendMessage`

The content script (`src/js/content-scripts.ts`) then:
- Initializes keyboard shortcuts
- Sets cycle time and development time
- Loads AI features
- Renders React FAB component via the content bridge

### React-Service Worker Communication
React components use a message passing pattern:
1. React component posts message to window: `window.postMessage({ type: 'FROM_PAGE', message: {...} })`
2. Content bridge listener receives and validates
3. Content bridge forwards to service worker: `chrome.runtime.sendMessage({ action: '...' })`
4. Service worker processes and responds
5. Response flows back through content bridge to React

### AI Streaming System
React AI features use a separate streaming system:
- Service worker streams OpenAI responses via `chrome.runtime.sendMessage` with type `'react-ai-stream'`
- Content bridge routes to subscribed React components
- Components use `subscribeToReactAIResults()` to receive updates
- Completely isolated from legacy JS AI system

## Testing Configuration

Jest configuration highlights:
- Environment: jsdom
- Setup files: `jest.chromeSetup.js` (Chrome API mocks), `tests/setup.ts`
- Coverage excludes: `src/react/client/components/ui/**` (shadcn/ui components)
- Module name mapping for path aliases and CSS imports
- Timezone: UTC (enforced in test scripts)

## Build and Distribution

The build process:
1. `yarn build` runs `src/build-manifest.ts` to generate manifest.json
2. Webpack bundles all entry points to `build/` directory
3. `npm run dist` creates production build and zips to `dist/dist.zip`
4. Manifest version is synced with package.json via version scripts
