/**
 * Initialize React components
 */
export function initializeReact(): void {
  // Dynamically import React code
  import('../react').then(({ initReact }) => {
    initReact()
  }).catch(console.error)
}

/**
 * Clean up React components
 */
export function cleanupReact(): void {
  import('../react').then(({ unmountReact }) => {
    unmountReact()
  }).catch(console.error)
}
