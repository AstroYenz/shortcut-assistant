import { useEffect, useState } from 'react'

import { submitShortcutApiToken } from '@sx/react-bridge'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'


const STATUS_RESET_DELAY_MS = 3000

function Settings({ open }: { open: boolean }): React.ReactElement {
  const [showSettings, setShowSettings] = useState(open)
  const [mounted, setMounted] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (mounted) {
      setShowSettings(!showSettings)
    }
    if (!mounted) {
      setMounted(true)
    }
    return (): void => {
      setMounted(false)
    }
  }, [open])

  function handleApiKeyChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setApiKey(event.target.value)
  }

  async function handleSubmit(): Promise<void> {
    if (!apiKey.trim()) return

    setIsSubmitting(true)
    setSubmitStatus('loading')

    try {
      // Use the bridge to communicate with the content script
      const response = await submitShortcutApiToken(apiKey)

      if (response.success) {
        setSubmitStatus('success')
        // Clear the input after successful submission
        setApiKey('')

        // Reset status after a delay
        setTimeout(() => {
          setSubmitStatus('idle')
        }, STATUS_RESET_DELAY_MS)
      }
      else {
        console.error('Error submitting API token:', response.error)
        setSubmitStatus('error')
      }
    }
    catch (error) {
      console.error('Error submitting API token:', error)
      setSubmitStatus('error')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={showSettings} onOpenChange={setShowSettings}>
      <DrawerContent className="z-[9999]">
        <div className="mx-auto w-full max-w-md p-4">
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
          </DrawerHeader>
          <div className="flex items-center justify-center space-x-2">
            <Input
              name="apiKey"
              placeholder="Shortcut API Key"
              value={apiKey}
              onChange={handleApiKeyChange}
              disabled={isSubmitting}
              type="password"
            />
          </div>
          <p className="text-gray-400 text-xs mt-2 mb-4">
            This is required to enable advanced AI features. For added security, you must authenticate with Google before we will save the Shortcut API Key.
          </p>
          <DrawerFooter>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !apiKey.trim()}
              className={submitStatus === 'success' ? 'bg-green-600' : submitStatus === 'error' ? 'bg-red-600' : ''}
            >
              {isSubmitting
                ? 'Submitting...'
                : submitStatus === 'success'
                  ? 'Saved!'
                  : submitStatus === 'error'
                    ? 'Error'
                    : 'Authenticate'}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { Settings }
