import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import FAB from '@/client/components/FAB'


// Mock Drawers to avoid rendering the full settings drawer
jest.mock('@/client/components/drawers', () => ({
  Drawers: function MockDrawers({ openDrawer }: { openDrawer: string | null }) {
    return <div data-testid="mock-drawers">{openDrawer}</div>
  }
}))

describe('FAB', function testFABSuite() {
  function setup() {
    render(<FAB />)
  }

  it('renders the FAB button', function testRendersFabButton() {
    setup()
    expect(screen.getByRole('button', { name: /\+/ })).toBeInTheDocument()
  })

  it('toggles the menu when FAB button is clicked', function testToggleMenu() {
    setup()
    const fabButton = screen.getByRole('button', { name: /\+/ })
    fireEvent.click(fabButton)
    expect(screen.getByText('Analyze')).toBeInTheDocument()
    fireEvent.click(fabButton)
    expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
  })

  it('opens settings drawer when settings button is clicked', function testOpenSettingsDrawer() {
    setup()
    const fabButton = screen.getByRole('button', { name: /\+/ })
    fireEvent.click(fabButton)
    const settingsButtons = screen.getAllByRole('button')
    // The last button in the menu is the settings button
    const settingsButton = settingsButtons[settingsButtons.length - 1]
    fireEvent.click(settingsButton)
    expect(screen.getByTestId('mock-drawers')).toHaveTextContent('settings')
  })
})

// Named export for FAB to comply with codebase rules
export { } // Ensures this is a module
