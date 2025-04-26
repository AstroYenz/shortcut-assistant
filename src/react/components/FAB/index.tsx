import React, { useState } from 'react'
import './styles.css'


/**
 * Floating Action Button component
 */
function FAB(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Toggle the FAB menu open/closed
   */
  function handleToggle(): void {
    setIsOpen(!isOpen)
  }

  return (
    <div className="shortcut-assistant-fab">
      <button
        className={`shortcut-assistant-fab-button ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
      >
        <span className="shortcut-assistant-fab-icon">+</span>
      </button>

      {isOpen && (
        <div className="shortcut-assistant-fab-menu">
          <button className="shortcut-assistant-fab-menu-item">Analyze</button>
          <button className="shortcut-assistant-fab-menu-item">Break Up</button>
          <button className="shortcut-assistant-fab-menu-item">Add Labels</button>
        </div>
      )}
    </div>
  )
}

export default FAB
