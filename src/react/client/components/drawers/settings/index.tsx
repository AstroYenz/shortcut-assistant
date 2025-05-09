import { useEffect, useState } from 'react'

import { submitShortcutApiToken } from '@/bridge'
import { ApiTokenSection } from '@/client/components/drawers/settings/api-token-section'
import { GoogleAuthSection } from '@/client/components/drawers/settings/google-auth-section'
import { Button } from '@/client/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter } from '@/client/components/ui/drawer'


const STATUS_RESET_DELAY_MS = 3000

type Status = 'idle' | 'loading' | 'success' | 'error'

interface SettingsProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

function Settings({ open, onOpenChange }: SettingsProps): React.ReactElement {
  const [showSettings, setShowSettings] = useState(open)
  const [apiKey, setApiKey] = useState('')
  const [hasStoredToken, setHasStoredToken] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<Status>('idle')
  const [googleAuthStatus, setGoogleAuthStatus] = useState<Status>('idle')

  useEffect(() => {
    setShowSettings(open)
  }, [open])

  useEffect(() => {
    // Check if we have a stored API token
    chrome.storage.local.get(['backendKey'], (data) => {
      if (data.backendKey) {
        setHasStoredToken(true)
      }
    })
  }, [])

  function handleOpenChange(open: boolean): void {
    setShowSettings(open)
    if (onOpenChange) {
      onOpenChange(open)
    }
  }

  function handleApiKeyChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setApiKey(event.target.value)
  }

  function handleAuthStatusChange(status: Status): void {
    setGoogleAuthStatus(status)
  }

  async function handleSubmit(): Promise<void> {
    if (!apiKey.trim()) return

    setIsSubmitting(true)
    setSubmitStatus('loading')

    try {
      const response = await submitShortcutApiToken(apiKey)

      if (response.success) {
        setSubmitStatus('success')
        setApiKey('')
        setHasStoredToken(true)
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

  const buttonText = isSubmitting ? 'Submitting...' : submitStatus === 'success' ? 'Saved!' : submitStatus === 'error' ? 'Error' : hasStoredToken ? 'Update API Token' : 'Save API Token'

  return (
    <Drawer open={showSettings} onOpenChange={handleOpenChange}>
      <DrawerContent className="z-[9999]">
        <div className="mx-auto w-full max-w-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoogleAuthSection
              onAuthStatusChange={handleAuthStatusChange}
            />
            <ApiTokenSection
              apiKey={apiKey}
              hasStoredToken={hasStoredToken}
              isSubmitting={isSubmitting}
              googleAuthStatus={googleAuthStatus}
              onApiKeyChange={handleApiKeyChange}
            />
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !apiKey.trim() || googleAuthStatus !== 'success'}
              className={submitStatus === 'success' ? 'bg-green-600' : submitStatus === 'error' ? 'bg-red-600' : ''}
            >
              {buttonText}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { Settings }
