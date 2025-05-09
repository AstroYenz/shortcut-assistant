import { render, screen, fireEvent } from '@testing-library/react'

import { Drawers } from '@/client/components/drawers'
import { DrawerType } from '@/client/types/drawer'


jest.mock('@/client/components/drawers/settings', () => ({
  Settings: function MockSettings({ open, onOpenChange }: { open: boolean, onOpenChange?: (open: boolean) => void }) {
    return (
      <div
        data-testid="mock-settings"
        onClick={() => {
          if (onOpenChange) {
            onOpenChange(false)
          }
        }}
      >
        {open ? 'open' : 'closed'}
      </div>
    )
  }
}))

describe('Drawers', function testDrawersSuite() {
  function setup(openDrawer: DrawerType | null = null, onOpenChange?: (drawer: DrawerType | null) => void) {
    return render(
      <Drawers
        openDrawer={openDrawer}
        onOpenChange={onOpenChange}
      />
    )
  }

  it('renders without crashing', function testRendersWithoutCrashing() {
    setup()
    expect(screen.getByTestId('mock-settings')).toBeInTheDocument()
  })

  it('passes open prop to Settings when openDrawer is "settings"', function testPassesOpenPropToSettings() {
    setup('settings')
    expect(screen.getByTestId('mock-settings')).toHaveTextContent('open')
  })

  it('passes closed prop to Settings when openDrawer is not "settings"', function testPassesClosedPropToSettings() {
    setup(null)
    expect(screen.getByTestId('mock-settings')).toHaveTextContent('closed')
  })

  it('calls onOpenChange with null when Settings is closed', function testCallsOnOpenChangeWithNull() {
    const onOpenChangeMock = jest.fn()
    setup('settings', onOpenChangeMock)

    const mockSettings = screen.getByTestId('mock-settings')
    fireEvent.click(mockSettings)

    expect(onOpenChangeMock).toHaveBeenCalledWith(null)
  })

  it('does not crash when onOpenChange is not provided', function testNoOnOpenChange() {
    setup('settings')

    const mockSettings = screen.getByTestId('mock-settings')
    fireEvent.click(mockSettings)

    // Test passes if no error is thrown
    expect(true).toBe(true)
  })
})
