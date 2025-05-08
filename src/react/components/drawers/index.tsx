import { Settings } from '@/components/drawers/settings'
import { DrawerType } from '@/types/drawer'


function Drawers({ openDrawer }: { openDrawer: DrawerType }): React.ReactElement {
  return (
    <div>
      <Settings open={openDrawer === 'settings'} />
    </div>
  )
}

export { Drawers }
