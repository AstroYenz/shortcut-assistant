# React Components for Shortcut Assistant

This directory contains React components that are being developed as part of the refactoring effort to convert the Chrome extension to use React.

## Structure

- `index.tsx`: Entry point for React functionality
- `components/`: Directory containing all React components
- `contexts/`: React context providers
- `hooks/`: Custom React hooks

## Development

### Building with React

To include React components in the build, use the React-specific build commands:

```bash
# Development with React
yarn dev:react

# Build with React
yarn build:react

# Distribution with React
yarn dist:react
```

Without the React flag, the standard builds won't include React components:

```bash
# Standard development without React
yarn dev
```
