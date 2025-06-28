# DevContainer Setup for Shortcut Assistant

This devcontainer provides a complete development environment for the Shortcut Assistant Chrome extension with React integration.

## Features

- **Node.js 22** with Yarn package manager
- **Auto-rebuild** functionality with webpack watch mode
- **VS Code extensions** optimized for TypeScript, React, and Tailwind development
- **Debugging support** for Jest tests and build scripts
- **Integrated terminal** with zsh and Oh My Zsh
- **Port forwarding** for development servers

## Getting Started

1. **Open in DevContainer**
   - Install the "Dev Containers" extension in VS Code
   - Open the project folder in VS Code
   - When prompted, click "Reopen in Container" or use `Ctrl+Shift+P > Dev Containers: Reopen in Container`

2. **Start Development**
   - The container will automatically run `yarn install` after creation
   - Use one of these commands to start development:
     ```bash
     yarn dev          # Standard development build with auto-rebuild
     yarn dev:react    # Development build with React features enabled
     ```

3. **Load Extension in Chrome**
   - Run the development command above
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Drag the `build` folder onto the extensions page
   - The extension will be loaded and ready for testing

## Development Workflow

### Auto-Rebuild
The webpack watch mode will automatically rebuild your extension when files change. After making changes:
1. Files are automatically compiled
2. Manually refresh the extension in Chrome (click the refresh icon on the extension card)
3. Reload any pages where the extension is active


### Available VS Code Tasks
Access these via `Ctrl+Shift+P > Tasks: Run Task`:
- **Start Development (Auto-rebuild)** - Default build task
- **Start Development with React (Auto-rebuild)**
- **Build Production** / **Build Production with React**
- **Run Tests** / **Run Tests with Coverage**
- **Lint Code** / **Lint and Fix**

### Debugging
- **Jest Tests**: Use the "Debug Jest Tests" launch configuration
- **Current Test File**: Use "Debug Current Jest Test" when a test file is open
- **Build Scripts**: Use "Debug Build Script" for debugging the build process

## File Structure

```
.devcontainer/
├── devcontainer.json    # Main devcontainer configuration
└── README.md           # This file

.vscode/
├── tasks.json          # VS Code tasks for common operations
└── launch.json         # Debug configurations
```

## Port Forwarding

- **Port 3000**: Reserved for potential dev server
- **Port 9229**: Node.js debug port

## Tips

1. **Extension Reload**: After code changes, you'll need to manually reload the extension in Chrome
2. **React Development**: Use `yarn dev:react` when working on React components
3. **Testing**: The container includes Jest with proper timezone configuration
4. **Linting**: ESLint is configured to run on save and can be manually triggered
