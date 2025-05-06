import React from 'react'
import { createRoot, Root } from 'react-dom/client'

import FAB from './components/FAB'

// Store the React root instance for proper cleanup
let fabRoot: Root | undefined

/**
 * Initialize React application and mount the FAB component
 */
export function initReact(): void {
  // Check if FAB container already exists
  let container = document.getElementById('shortcut-assistant-fab-container')
  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div')
    container.id = 'shortcut-assistant-fab-container'
    document.body.appendChild(container)
  }

  // Only create root if it hasn't been created yet
  if (!fabRoot) {
    fabRoot = createRoot(container)
  }
  fabRoot.render(<FAB />)
}

/**
 * Clean up React components
 */
export function unmountReact(): void {
  const container = document.getElementById('shortcut-assistant-fab-container')
  if (container && fabRoot) {
    fabRoot.unmount()
    fabRoot = undefined
    document.body.removeChild(container)
  }
}
