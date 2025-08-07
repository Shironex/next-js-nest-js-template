'use client'
import { clientEnv } from '@/env/client'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { useTheme } from 'next-themes'
import React, { useRef } from 'react'

const TurnstileComponent = React.memo(
  ({ onSuccess, onError }: { onSuccess: (token: string) => void; onError: () => void }) => {
    const turnstileRef = useRef<TurnstileInstance | null>(null)
    const { theme, resolvedTheme } = useTheme()

    // Use resolvedTheme to get the actual theme (handles 'system' preference)
    // Fall back to 'light' if theme is not yet loaded (SSR)
    const turnstileTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

    return (
      <Turnstile
        ref={turnstileRef}
        siteKey={clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onError}
        options={{ theme: turnstileTheme }}
      />
    )
  },
)

TurnstileComponent.displayName = 'TurnstileComponent'

export { TurnstileComponent as Turnstile }
