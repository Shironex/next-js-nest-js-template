'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

interface BackButtonProps {
  href?: string
  className?: string
}

export function BackButton({ href = '/', className }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      className={cn(
        'absolute left-4 top-4 h-8 w-8 rounded-full p-0',
        'md:left-8 md:top-8',
        className,
      )}
      aria-label="Go back to homepage"
    >
      <Link href={href}>
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Button>
  )
}
