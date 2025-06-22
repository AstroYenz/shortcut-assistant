import React, { useState } from 'react'

import '@/styles/globals.css'
import './styles.css'
import { ShortcutAssistantModal } from '@/client/components/shortcut-assistant-modal'


function FAB(): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleToggle(): void {
    setIsModalOpen(!isModalOpen)
  }

  function handleModalChange(open: boolean): void {
    setIsModalOpen(open)
  }

  return (
    <>
      <div className="shortcut-assistant-fab">
        <button
          className="shortcut-assistant-fab-button"
          onClick={handleToggle}
          aria-label="Open Shortcut Story Assistant"
          title="Open Shortcut Story Assistant"
          name="Open Shortcut Story Assistant"
          type="button"
        >
          <span className="shortcut-assistant-fab-icon">+</span>
        </button>
      </div>
      <ShortcutAssistantModal
        open={isModalOpen}
        onOpenChange={handleModalChange}
      />
    </>
  )
}

export default FAB
