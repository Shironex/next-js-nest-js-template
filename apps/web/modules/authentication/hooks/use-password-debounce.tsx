'use client'

import { useCallback, useRef, useState } from 'react'

const usePasswordDebounce = (initialValue: string = '', delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [immediateValue, setImmediateValue] = useState(initialValue)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const updateValue = useCallback(
    (value: string) => {
      setImmediateValue(value)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
    },
    [delay],
  )

  return { debouncedValue, immediateValue, updateValue }
}

export default usePasswordDebounce
