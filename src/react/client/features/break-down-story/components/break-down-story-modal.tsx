import React from 'react'


interface BreakDownStoryModalProps {
  onClose?: () => void
}

function BreakDownStoryModal({ onClose }: BreakDownStoryModalProps): React.ReactElement {
  function handleClose(): void {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Break Down Story</h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="text-center py-8 space-y-4">
        <p className="text-gray-500">Break Down Story feature is coming soon!</p>
        <p className="text-sm text-gray-400">
          This feature will help you split large stories into smaller, more manageable tasks.
        </p>
      </div>
    </div>
  )
}

export { BreakDownStoryModal }