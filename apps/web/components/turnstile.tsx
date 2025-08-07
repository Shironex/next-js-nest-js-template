'use client'
import { clientEnv } from '@/env/client'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import React, { useRef } from 'react'

const TurnstileComponent = React.memo(
  ({ onSuccess, onError }: { onSuccess: (token: string) => void; onError: () => void }) => {
    const turnstileRef = useRef<TurnstileInstance | null>(null)

    return (
      <Turnstile
        ref={turnstileRef}
        siteKey={clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onError}
        options={{ theme: 'light' }}
      />
    )
  },
)

TurnstileComponent.displayName = 'TurnstileComponent'

export { TurnstileComponent as Turnstile }
