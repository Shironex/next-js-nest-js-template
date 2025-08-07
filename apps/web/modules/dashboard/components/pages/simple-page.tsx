'use client'

import { motion } from 'framer-motion'
import { useAuthRedirect } from '@/modules/dashboard/hooks/use-auth-redirect'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'

interface SimplePageProps {
  title: string
  description: string
  icon: React.ReactNode
  children?: React.ReactNode
}

export function SimplePage({ title, description, icon, children }: SimplePageProps) {
  const { isUserAuth } = useAuthRedirect()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (!isUserAuth) {
    return null
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <CardDescription>
              This is a placeholder page for the {title.toLowerCase()} section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {children || (
              <div className="bg-muted/50 aspect-[2/1] w-full rounded-lg p-4">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">{icon}</div>
                    <p className="text-muted-foreground">
                      Content for {title.toLowerCase()} will be implemented here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
