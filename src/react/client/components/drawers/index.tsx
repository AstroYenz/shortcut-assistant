import { Settings } from '@/client/components/drawers/settings'
import { DrawerType } from '@/client/types/drawer'


/**
 * Renders the various drawers associated with the options that appear in the floating action button
 * @param openDrawer - The drawer to open
 * @param onOpenChange - The function to call when the drawer is opened or closed
 * @returns A React element
 */
function Drawers({ openDrawer, onOpenChange }: { openDrawer: DrawerType | null, onOpenChange?: (drawer: DrawerType | null) => void }): React.ReactElement {
  /**
   * Handles the opening and closing of drawers
   * @param open - Whether the drawer is open
   */
  function handleOpenChange(open: boolean): void {
    if (!open && onOpenChange) {
      onOpenChange(null)
    }
  }

  return (
    <Settings
      open={openDrawer === 'settings'}
      onOpenChange={handleOpenChange}
    />
  )
}

export { Drawers }
