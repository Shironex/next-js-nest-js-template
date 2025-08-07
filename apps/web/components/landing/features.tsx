'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { BarChart3, Clock, Cloud, Code2, Lock, MessageSquare, Settings, Zap } from 'lucide-react'

const features = [
  {
    icon: <Zap className="h-10 w-10" />,
    title: 'Lightning Fast',
    description:
      'Experience unparalleled speed with our optimized platform, designed for maximum efficiency.',
  },
  {
    icon: <Cloud className="h-10 w-10" />,
    title: 'Cloud-Based',
    description: 'Access your work from anywhere with our secure cloud infrastructure.',
  },
  {
    icon: <Lock className="h-10 w-10" />,
    title: 'Enterprise Security',
    description: 'Rest easy with our bank-level security protocols protecting your sensitive data.',
  },
  {
    icon: <BarChart3 className="h-10 w-10" />,
    title: 'Advanced Analytics',
    description: 'Gain valuable insights with our comprehensive analytics and reporting tools.',
  },
  {
    icon: <MessageSquare className="h-10 w-10" />,
    title: 'Team Collaboration',
    description: 'Enhance teamwork with real-time collaboration features and shared workspaces.',
  },
  {
    icon: <Settings className="h-10 w-10" />,
    title: 'Customizable',
    description: 'Tailor the platform to your specific needs with extensive customization options.',
  },
  {
    icon: <Code2 className="h-10 w-10" />,
    title: 'Developer API',
    description: 'Integrate seamlessly with your existing tools using our comprehensive API.',
  },
  {
    icon: <Clock className="h-10 w-10" />,
    title: '24/7 Support',
    description: 'Get help whenever you need it with our round-the-clock customer support.',
  },
]

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="features" className="bg-muted/50 py-20">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features for Modern Teams
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-[700px] text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to streamline your workflow and boost productivity
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md"
              variants={item}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
