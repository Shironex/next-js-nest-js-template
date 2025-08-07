'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Loader2, CheckCircle, Mail } from 'lucide-react'
import AuthLayout from './aut-layout'
import { Button } from '@workspace/ui/components/button'
import { APP_ROUTES } from '@/lib/constants'
import { useVerifyEmail } from '../hooks/use-verify-email'
import { useResendVerification } from '../hooks/use-resend-verification'
import { useForm } from 'react-hook-form'
import {
  VerifyEmailFormData,
  verifyEmailSchema,
  ResendVerificationFormData,
  resendVerificationSchema,
} from '../utils/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@workspace/ui/components/input-otp'
import { Turnstile } from '@/components/turnstile'
import { useLogout } from '../hooks/use-logout'
import { useRouter } from 'next/navigation'

const VerifyEmailForm = ({ email }: { email: string }) => {
  const router = useRouter()
  const verifyEmail = useVerifyEmail()
  const resendVerification = useResendVerification()
  const logout = useLogout({ autoRedirect: false })
  const [isVerified, setIsVerified] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
      turnstileToken: '',
    },
  })

  const resendForm = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      turnstileToken: '',
    },
  })

  // Generate unique localStorage key for this email
  const storageKey = `resend_cooldown_${email}`

  // Initialize resend cooldown from localStorage
  useEffect(() => {
    const checkCooldown = () => {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const { endTime } = JSON.parse(stored)
        const now = Date.now()
        const remainingTime = Math.max(0, Math.ceil((endTime - now) / 1000))

        if (remainingTime > 0) {
          setResendCooldown(remainingTime)
          setCanResend(false)
        } else {
          setCanResend(true)
          setResendCooldown(0)
          localStorage.removeItem(storageKey)
        }
      }
    }

    // Check immediately
    checkCooldown()

    // Set up timer to update countdown
    const timer = setInterval(() => {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const { endTime } = JSON.parse(stored)
        const now = Date.now()
        const remainingTime = Math.max(0, Math.ceil((endTime - now) / 1000))

        if (remainingTime > 0) {
          setResendCooldown(remainingTime)
          setCanResend(false)
        } else {
          setCanResend(true)
          setResendCooldown(0)
          localStorage.removeItem(storageKey)
        }
      } else {
        setCanResend(true)
        setResendCooldown(0)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [email, storageKey])

  function onSubmit(data: VerifyEmailFormData) {
    verifyEmail.mutate(data, {
      onSuccess: () => {
        // Clear the cooldown when email is successfully verified
        localStorage.removeItem(storageKey)
        setIsVerified(true)
      },
    })
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push(APP_ROUTES.LOGIN)
      },
    })
  }

  function handleResendCode() {
    const turnstileToken = resendForm.getValues('turnstileToken')
    if (!turnstileToken) {
      return
    }

    resendVerification.mutate(
      { turnstileToken },
      {
        onSuccess: () => {
          // Save cooldown end time to localStorage
          const cooldownDuration = 60 // seconds
          const endTime = Date.now() + cooldownDuration * 1000

          localStorage.setItem(storageKey, JSON.stringify({ endTime }))

          setCanResend(false)
          setResendCooldown(cooldownDuration)
        },
      },
    )
  }

  function handleTurnstileVerify(token: string) {
    form.setValue('turnstileToken', token)
    resendForm.setValue('turnstileToken', token)
  }

  function handleTurnstileError() {
    form.setValue('turnstileToken', '')
    resendForm.setValue('turnstileToken', '')
  }

  if (isVerified) {
    return (
      <AuthLayout title="Email Verified!" subtitle="Your account has been successfully activated">
        <motion.div
          className="space-y-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </motion.div>

          <Button asChild className="w-full">
            <Link href={APP_ROUTES.HOME}>Continue to Dashboard</Link>
          </Button>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent an 8-digit verification code to ${email}`}
    >
      <div className="mx-auto w-full max-w-sm space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input Section */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP maxLength={8} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                          <InputOTPSlot index={6} />
                          <InputOTPSlot index={7} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormDescription className="text-center">
                    Enter the 8-digit verification code sent to your email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Turnstile */}
            <FormField
              control={form.control}
              name="turnstileToken"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-center">
                      <Turnstile onSuccess={handleTurnstileVerify} onError={handleTurnstileError} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={
                form.getValues('code').length !== 8 ||
                !form.getValues('turnstileToken') ||
                verifyEmail.isPending
              }
              className="w-full"
            >
              {verifyEmail.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>
        </Form>

        {/* Resend Section */}
        <div className="space-y-4 border-t pt-6">
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground text-sm">Didn't receive the code?</p>
            {canResend ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={resendVerification.isPending || !resendForm.getValues('turnstileToken')}
                className="w-full"
              >
                {resendVerification.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Code
                  </>
                )}
              </Button>
            ) : (
              <div className="text-muted-foreground py-2 text-sm">
                Resend available in {resendCooldown} seconds
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmailForm
