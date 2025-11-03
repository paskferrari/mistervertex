"use client"

import Button from '@/ui/Button'
import { HelpCircle } from 'lucide-react'
import OnboardingGuide, { useOnboarding } from '@/components/OnboardingGuide'
import { useHapticFeedback, useDeviceType } from '@/hooks/useTouch'

export default function OnboardingClient() {
  const { isOnboardingOpen, openOnboarding, closeOnboarding, completeOnboarding } = useOnboarding()
  const { lightTap } = useHapticFeedback()
  const { isTouchDevice } = useDeviceType()

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          openOnboarding()
          if (isTouchDevice) lightTap()
        }}
        className="flex items-center space-x-2 px-3 py-2"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Guida</span>
      </Button>
      <OnboardingGuide
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </>
  )
}