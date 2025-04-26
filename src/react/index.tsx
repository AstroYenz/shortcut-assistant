import React from 'react'
import { createRoot } from 'react-dom/client'

import FAB from './components/FAB'

/**
 * Initialize React application and mount the FAB component
 */
export function initReact() {
  // Check if FAB container already exists
  let container = document.getElementById('shortcut-assistant-fab-container')
  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div')
    container.id = 'shortcut-assistant-fab-container'
    document.body.appendChild(container)
  }

  // Create React root and render FAB
  const root = createRoot(container)
  root.render(<FAB />)
}

/**
 * Clean up React components
 */
export function unmountReact() {
  const container = document.getElementById('shortcut-assistant-fab-container')
  if (container) {
    document.body.removeChild(container)
  }
}
