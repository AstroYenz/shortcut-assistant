import { Settings } from '@/components/drawers/settings'
import { DrawerType } from '@/types/drawer'


function Drawers({ openDrawer, onOpenChange }: { openDrawer: DrawerType | null; onOpenChange?: (drawer: DrawerType | null) => void }): React.ReactElement {
  function handleSettingsOpenChange(open: boolean): void {
    if (!open && onOpenChange) {
      onOpenChange(null)
    }
  }

  return (
    <div>
      <Settings
        open={openDrawer === 'settings'}
        onOpenChange={handleSettingsOpenChange}
      />
    </div>
  )
}

export { Drawers }
