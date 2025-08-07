'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function AnimatedPanel() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="from-primary/20 via-primary/5 to-background absolute inset-0 bg-gradient-to-br" />

      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-foreground text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Secure, seamless authentication</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative h-[400px] w-[400px]"
        >
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            {/* Background circle */}
            <motion.circle
              cx="200"
              cy="200"
              r="180"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />

            {/* Orbiting circles */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.circle
                key={i}
                cx="200"
                cy="200"
                r={120 - i * 15}
                stroke="currentColor"
                strokeOpacity={0.1 + i * 0.05}
                strokeWidth="2"
                strokeDasharray="10 5"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20 + i * 5,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
                style={{ originX: '50%', originY: '50%' }}
              />
            ))}

            {/* Animated nodes */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i * Math.PI * 2) / 8
              const x = 200 + Math.cos(angle) * 150
              const y = 200 + Math.sin(angle) * 150

              return (
                <motion.g key={i}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="currentColor"
                    fillOpacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      delay: 1 + i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Connection lines */}
                  {[0, 1, 2].map((j) => {
                    const targetIndex = (i + j + 1) % 8
                    const targetAngle = (targetIndex * Math.PI * 2) / 8
                    const targetX = 200 + Math.cos(targetAngle) * 150
                    const targetY = 200 + Math.sin(targetAngle) * 150

                    return (
                      <motion.line
                        key={`${i}-${j}`}
                        x1={x}
                        y1={y}
                        x2={targetX}
                        y2={targetY}
                        stroke="currentColor"
                        strokeOpacity="0.2"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 2,
                          delay: 2 + i * 0.2,
                          ease: 'easeInOut',
                        }}
                      />
                    )
                  })}
                </motion.g>
              )
            })}

            {/* Central icon */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 3, duration: 1, ease: 'easeOut' }}
            >
              <circle cx="200" cy="200" r="40" fill="currentColor" fillOpacity="0.1" />
              <motion.path
                d="M185 200L195 210L215 190"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 3.5, duration: 0.5 }}
              />
            </motion.g>

            {/* Pulsing rings */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={`pulse-${i}`}
                cx="200"
                cy="200"
                r="40"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="2"
                fill="transparent"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 3,
                  delay: i * 1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                style={{ originX: '50%', originY: '50%' }}
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
