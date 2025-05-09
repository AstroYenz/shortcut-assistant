import { useEffect, useState } from 'react'

import { submitShortcutApiToken } from '@/bridge'
import { ApiTokenSection } from '@/client/components/drawers/settings/api-token-section'
import { AuthStatus, GoogleAuthSection } from '@/client/components/drawers/settings/google-auth-section'
import { Button } from '@/client/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter } from '@/client/components/ui/drawer'
import { cn } from '@/client/lib/utils'


const STATUS_RESET_DELAY_MS = 3000

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

interface SettingsProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

function Settings({ open, onOpenChange }: SettingsProps): React.ReactElement {
  const [showSettings, setShowSettings] = useState(open)
  const [apiKey, setApiKey] = useState('')
  const [hasStoredToken, setHasStoredToken] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [googleAuthStatus, setGoogleAuthStatus] = useState<AuthStatus>('idle')

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

  function handleAuthStatusChange(status: AuthStatus): void {
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
        // Reset the button text after a delay, ie. from 'Saved!' to 'Update API Token'
        setTimeout(() => {
          setSubmitStatus('idle')
        }, STATUS_RESET_DELAY_MS)
      }
      else {
        console.error('Error submitting API token:', response.data.error)
        setSubmitStatus('error')
        // Reset the error state after the same delay as success
        setTimeout(() => {
          setSubmitStatus('idle')
        }, STATUS_RESET_DELAY_MS)
      }
    }
    catch (error) {
      console.error('Error submitting API token:', error)
      setSubmitStatus('error')
      // Reset the error state after the same delay as success
      setTimeout(() => {
        setSubmitStatus('idle')
      }, STATUS_RESET_DELAY_MS)
    }
    finally {
      setIsSubmitting(false)
    }
  }

  type ButtonText = 'Submitting...' | 'Saved!' | 'Error' | 'Update API Token' | 'Save API Token'

  const getButtonText = (): ButtonText => {
    if (isSubmitting) return 'Submitting...'
    if (submitStatus === 'success') return 'Saved!'
    if (submitStatus === 'error') return 'Error'
    return hasStoredToken ? 'Update API Token' : 'Save API Token'
  }

  const buttonText = getButtonText()

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
              disabled={isSubmitting || !apiKey.trim() || googleAuthStatus !== 'authenticated'}
              className={cn({
                'bg-green-600': submitStatus === 'success',
                'bg-red-600': submitStatus === 'error'
              })}
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
