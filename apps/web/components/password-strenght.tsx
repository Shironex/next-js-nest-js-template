'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PasswordStrengthProps {
  password: string
}

const PasswordStrength: React.FC<PasswordStrengthProps> = React.memo(({ password }) => {
  const getStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const getStrengthText = (score: number) => {
    if (score === 0) return { text: '', color: '' }
    if (score <= 2) return { text: 'Weak', color: 'text-red-500' }
    if (score <= 3) return { text: 'Fair', color: 'text-yellow-500' }
    if (score <= 4) return { text: 'Good', color: 'text-blue-500' }
    return { text: 'Strong', color: 'text-green-500' }
  }

  const strength = getStrength(password)
  const { text, color } = getStrengthText(strength)

  if (!password) return null

  return (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-2">
        <div className="flex flex-1 space-x-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`h-1 flex-1 rounded-full ${i < strength ? 'bg-current' : 'bg-gray-200'} ${color}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < strength ? 1 : 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${color}`}>{text}</span>
      </div>

      <div className="mt-2 space-y-1 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}
          />
          <span>Co najmniej 8 znaków</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}
          />
          <span>Jedna wielka litera</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}
          />
          <span>Jedna cyfra</span>
        </div>
      </div>
    </motion.div>
  )
})

PasswordStrength.displayName = 'PasswordStrength'

export default PasswordStrength
