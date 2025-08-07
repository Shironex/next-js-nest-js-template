'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { ForgotPasswordFormData, forgotPasswordSchema } from '../utils/validation'
import { useForgotPassword } from '../hooks/use-forgot-password'
import AuthLayout from './aut-layout'
import { APP_ROUTES } from '@/lib/constants'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { Turnstile } from '@/components/turnstile'

const ForgotPasswordForm = () => {
  const [emailSent, setEmailSent] = useState(false)
  const forgotPassword = useForgotPassword()
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      turnstileToken: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        setEmailSent(true)
        form.reset()
      },
    })
  }

  const handleTurnstileVerify = (token: string) => {
    form.setValue('turnstileToken', token)
  }

  const handleTurnstileError = () => {
    form.setValue('turnstileToken', '')
  }

  if (emailSent) {
    return (
      <AuthLayout>
        <div className="space-y-6 pt-10 md:pt-0">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="mb-4 text-lg font-semibold">Reset link sent!</h3>
              <p className="text-muted-foreground mb-6">
                Check your email and follow the instructions to reset your password. The link will
                expire in 1 hour.
              </p>

              <div className="space-y-3">
                <Button onClick={() => setEmailSent(false)} variant="outline" className="w-full">
                  Send again
                </Button>

                <Link href={APP_ROUTES.LOGIN}>
                  <Button variant="ghost" className="w-full">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6 pt-10 md:pt-0">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Forgot password</h1>
          <p className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="turnstileToken"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-start">
                      <Turnstile onSuccess={handleTurnstileVerify} onError={handleTurnstileError} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Remember your password?{' '}
          <Link
            href={APP_ROUTES.LOGIN}
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordForm
