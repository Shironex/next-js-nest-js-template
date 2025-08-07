import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  description: string
  trend: 'up' | 'down'
  icon: React.ReactNode
  delay?: number
}

export function StatsCard({ title, value, description, trend, icon, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-muted-foreground flex items-center text-xs">
            {trend === 'up' ? (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {description}
            </span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
