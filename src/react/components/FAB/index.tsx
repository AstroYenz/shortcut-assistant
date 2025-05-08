import { Settings } from 'lucide-react'
import React, { useState } from 'react'

import '@sx/../styles/globals.css'
import './styles.css'
import { Drawers } from '@/components/drawers'
import { DrawerType } from '@/types/drawer'


function FAB(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [openDrawer, setOpenDrawer] = useState<DrawerType | null>(null)

  function handleToggle(): void {
    setIsOpen(!isOpen)
  }

  return (
    <>
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
            <button
              className="shortcut-assistant-fab-menu-item"
              onClick={() => {
                setOpenDrawer('settings')
              }}
            >
              <Settings />
            </button>
          </div>
        )}
      </div>
      <Drawers openDrawer={openDrawer} />
    </>
  )
}

export default FAB
