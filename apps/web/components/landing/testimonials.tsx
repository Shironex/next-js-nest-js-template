'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart',
    content:
      'This platform has revolutionized how our team works. The efficiency gains are remarkable and the support is outstanding.',
    rating: 5,
    avatar: '/placeholder-user.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'CTO, DataFlow',
    content:
      "The best investment we've made for our company. The analytics features alone have saved us countless hours.",
    rating: 5,
    avatar: '/placeholder-user.jpg',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager, InnovateCorp',
    content:
      'Incredible platform with top-notch security. Our team productivity has increased by 40% since we started using it.',
    rating: 5,
    avatar: '/placeholder-user.jpg',
  },
  {
    name: 'David Kim',
    role: 'Director of Operations, ScaleCo',
    content:
      "The collaboration tools are game-changing. We've never been more connected and efficient as a distributed team.",
    rating: 5,
    avatar: '/placeholder-user.jpg',
  },
  {
    name: 'Lisa Thompson',
    role: 'Founder, CreativeStudio',
    content:
      'Simple, powerful, and reliable. Everything we need to manage our projects and team in one beautiful interface.',
    rating: 5,
    avatar: '/placeholder-user.jpg',
  },
  {
    name: 'James Wilson',
    role: 'VP Engineering, BuildTech',
    content:
      'The API integrations are seamless and the customization options are endless. Perfect for our complex workflows.',
    rating: 5,
    avatar: '/placeholder-user.jpg',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Loved by Teams Worldwide
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-[700px] text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            See what our customers have to say about their experience
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-xl border p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="mb-4 flex items-center gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-4">
                "{testimonial.content}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-sm font-medium">
                    {testimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
