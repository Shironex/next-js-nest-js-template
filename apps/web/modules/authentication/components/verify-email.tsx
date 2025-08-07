'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import AuthLayout from './aut-layout'
import { Button } from '@workspace/ui/components/button'
import { APP_ROUTES } from '@/lib/constants'
import { useVerifyEmail } from '../hooks/use-verify-email'
import { useForm } from 'react-hook-form'
import { VerifyEmailFormData, verifyEmailSchema } from '../utils/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@workspace/ui/components/input-otp'
import { Turnstile } from '@/components/turnstile'
import { useLogout } from '../hooks/use-logout'
import { useRouter } from 'next/navigation'

const VerifyEmailForm = ({ email }: { email: string }) => {
  const router = useRouter()
  const verifyEmail = useVerifyEmail()
  const logout = useLogout({ autoRedirect: false })
  const [isVerified, setIsVerified] = useState(false)

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
      turnstileToken: '',
    },
  })

  function onSubmit(data: VerifyEmailFormData) {
    verifyEmail.mutate(data, {
      onSuccess: () => {
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

  function handleTurnstileVerify(token: string) {
    form.setValue('turnstileToken', token)
  }

  function handleTurnstileError() {
    form.setValue('turnstileToken', '')
  }

  if (isVerified) {
    return (
      <AuthLayout title="Email Zweryfikowany!" subtitle="Twoje konto zostało pomyślnie aktywowane">
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

          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
            <Link href={APP_ROUTES.HOME}>Przenieś na stronę główną</Link>
          </Button>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Zweryfikuj swój adres e-mail"
      subtitle={`Przesłaliśmy 8 cyfrowy kod weryfikacyjny na ${email}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kod weryfikacyjny</FormLabel>
                    <FormControl>
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
                    </FormControl>
                    <FormDescription>
                      Proszę wprowadzić kod weryfikacyjny wysłany na Twój adres e-mail.
                    </FormDescription>
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
                        <Turnstile
                          onSuccess={handleTurnstileVerify}
                          onError={handleTurnstileError}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {verifyEmail.isPending && (
                <motion.div
                  className="flex items-center justify-center space-x-2 text-amber-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Verifying code...</span>
                </motion.div>
              )}
            </div>

            {/* Verify Button */}
            <Button
              disabled={
                form.getValues('code').length !== 6 || verifyEmail.isPending || logout.isPending
              }
              className="w-full bg-amber-600 py-3 text-base font-semibold text-white hover:bg-amber-700"
            >
              {verifyEmail.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Zweryfikuj adres e-mail'
              )}
            </Button>

            {/* Back to Sign In */}
            <motion.div
              className="border-t border-gray-200 pt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleLogout}
                disabled={logout.isPending || verifyEmail.isPending}
                variant={'link'}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                {!logout.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Powrót do logowania
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}

export default VerifyEmailForm
