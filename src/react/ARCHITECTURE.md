# React Architecture - Shortcut Story Assistant

## Overview

This document describes the new React-based architecture for the Shortcut Story Assistant Chrome extension, which provides a modern, scalable frontend while preserving all existing functionality.

## Architecture Principles

### 1. Decoupling
- React components (`src/react/`) do NOT directly import from legacy JS code (`src/js/`)
- All communication happens asynchronously via `chrome.runtime.sendMessage`
- Bridge pattern provides clean separation of concerns

### 2. Feature Flag Protection
- Entire React architecture is wrapped in `ENABLE_REACT` environment variable check
- Legacy functionality remains fully intact when React is disabled
- Allows for gradual rollout and easy rollback

### 3. State Management
- `StoryProvider` context manages story data throughout the React app
- `useStoryContext` hook provides access to story information
- Local component state for UI-specific states (loading, errors, etc.)

### 4. Feature-Based Organization
```
src/react/client/features/
├── analyze-story/
│   └── components/
│       └── analyze-story-modal.tsx
└── break-down-story/
    └── components/
        └── break-down-story-modal.tsx
```

## Components

### Core Components

#### `FAB` (Floating Action Button)
- Entry point for all user interactions
- Triggers the main assistant modal
- Replaces the previous menu-based approach

#### `ShortcutAssistantModal`
- Main modal container with navigation between different views
- Houses all features and settings
- Uses drawer-based UI pattern for mobile-friendly design

#### `StoryProvider`
- Context provider for story data management
- Automatically extracts story information from DOM
- Provides refresh capability for real-time updates

### Feature Components

#### `AnalyzeStoryModal`
- Implements story analysis using existing AI functionality
- Follows async state management pattern (idle/loading/success/error)
- Displays results in user-friendly format

#### `BreakDownStoryModal`
- Placeholder for future story breakdown functionality
- Maintains consistent UI patterns
- Ready for implementation when business logic is available

## Communication Bridge

### Message Flow
1. React component calls bridge function (e.g., `analyzeStory()`)
2. Bridge sends message via `window.postMessage` to content script
3. Content script receives message and forwards to service worker
4. Service worker processes request using existing legacy code
5. Response flows back through the same chain

### Bridge Functions
- `analyzeStory(description)` - Triggers AI analysis
- `submitShortcutApiToken(token)` - Handles API token storage
- `initiateGoogleOAuth()` - Manages Google authentication

## Integration Points

### Content Script Integration
- React bridge initializes only when `ENABLE_REACT=true`
- Coexists with existing content script functionality
- Clean separation ensures no conflicts

### Legacy Functionality Preservation
- All existing keyboard shortcuts work unchanged
- Traditional button-based UI remains functional
- Settings and authentication logic reused

## Development Guidelines

### Adding New Features
1. Create feature directory under `src/react/client/features/`
2. Add bridge function if backend communication needed
3. Implement component following async state patterns
4. Add to main modal navigation

### Styling
- Use Tailwind CSS for all styling
- Follow existing component patterns
- Use `cn()` utility for conditional classes

### Error Handling
- Implement loading/success/error states
- Use consistent error messaging
- Graceful fallbacks for network issues

## Future Enhancements

### Planned Features
- Story breakdown functionality
- Enhanced AI suggestions
- Bulk story operations
- Custom workflow integrations

### Technical Improvements
- Enhanced TypeScript strict mode
- Component testing expansion
- Performance optimizations
- Accessibility improvements

## Troubleshooting

### Common Issues
- **React not loading**: Check `ENABLE_REACT` environment variable
- **Bridge communication failing**: Verify message handlers in content bridge
- **Story data not loading**: Ensure DOM elements are available when context initializes

### Debug Mode
Set environment variable `DEBUG_REACT=true` to enable additional logging.