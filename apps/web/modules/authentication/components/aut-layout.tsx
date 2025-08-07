'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
      {/* Left Side - Auth Form */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Logo */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/" className="inline-block">
              <motion.div
                className="mb-2 font-serif text-3xl font-bold text-amber-800"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Restored Elegance
              </motion.div>
            </Link>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            className="rounded-2xl border border-amber-100 bg-white p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Furniture Animation */}

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 lg:flex">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d97706' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Animated Furniture Elements */}
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {/* Main Chair Animation */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Chair SVG */}
            <motion.svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              className="text-amber-700"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1 }}
            >
              {/* Chair Back */}
              <motion.path
                d="M80 50 L80 150 L220 150 L220 50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
              />

              {/* Chair Seat */}
              <motion.rect
                x="70"
                y="150"
                width="160"
                height="20"
                rx="10"
                fill="currentColor"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.8 }}
              />

              {/* Chair Legs */}
              <motion.g
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.2 }}
              >
                <line
                  x1="80"
                  y1="170"
                  x2="80"
                  y2="220"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line
                  x1="220"
                  y1="170"
                  x2="220"
                  y2="220"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line
                  x1="80"
                  y1="50"
                  x2="80"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line
                  x1="220"
                  y1="50"
                  x2="220"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </motion.g>
            </motion.svg>

            {/* Restoration Sparkles */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.5 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-amber-400"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 2.5 + i * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Floating Tools */}
          <motion.div
            className="absolute right-20 top-20"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-600 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-20"
            animate={{
              y: [0, 10, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-700 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </motion.div>

          {/* Text Animation */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 transform text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3 }}
          >
            <motion.h3
              className="mb-2 font-serif text-2xl font-bold text-amber-800"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Restoring Timeless Beauty
            </motion.h3>
            <p className="text-amber-700">Bringing vintage furniture back to life</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
