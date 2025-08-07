'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'

interface StatusBadgeProps {
  status: 'Available' | 'Sold' | 'Reserved'
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const variants = {
    Available: 'bg-green-100 text-green-800 border-green-200',
    Reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Sold: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <motion.span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[status],
        className,
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {status}
    </motion.span>
  )
}

export default StatusBadge
