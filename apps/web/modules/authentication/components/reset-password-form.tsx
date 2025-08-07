'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { ResetPasswordFormData, resetPasswordSchema } from '../utils/validation'
import { useResetPassword } from '../hooks/use-reset-password'
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

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const resetPassword = useResetPassword()
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
      turnstileToken: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    resetPassword.mutate(
      { ...data, token },
      {
        onSuccess: () => {
          setResetSuccess(true)
          form.reset()
        },
      },
    )
  }

  const handleTurnstileVerify = (tokenValue: string) => {
    form.setValue('turnstileToken', tokenValue)
  }

  const handleTurnstileError = () => {
    form.setValue('turnstileToken', '')
  }

  const handleGoToLogin = () => {
    router.push(APP_ROUTES.LOGIN)
  }

  // Show error if no token is provided
  if (!token) {
    return (
      <AuthLayout
        title="Nieprawidłowy link resetujący"
        subtitle="Link do resetowania hasła jest nieprawidłowy lub wygasł"
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <AlertCircle className="h-8 w-8 text-red-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Nieprawidłowy lub wygasły link
            </h3>
            <p className="mb-6 text-gray-600">
              Ten link do resetowania hasła jest nieprawidłowy lub wygasł. Proszę poprosić o nowy.
            </p>

            <div className="space-y-3">
              <Link href={APP_ROUTES.FORGOT_PASSWORD}>
                <Button className="w-full bg-amber-600 text-white hover:bg-amber-700">
                  Poproś o nowy link
                </Button>
              </Link>

              <Link href={APP_ROUTES.LOGIN}>
                <Button variant="ghost" className="w-full">
                  Powrót do logowania
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AuthLayout>
    )
  }

  // Show success state
  if (resetSuccess) {
    return (
      <AuthLayout
        title="Hasło zostało zresetowane"
        subtitle="Twoje hasło zostało pomyślnie zaktualizowane"
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Hasło zostało pomyślnie zaktualizowane!
            </h3>
            <p className="mb-6 text-gray-600">Możesz teraz zalogować się używając nowego hasła.</p>

            <Button
              onClick={handleGoToLogin}
              className="w-full bg-amber-600 text-white hover:bg-amber-700"
            >
              Zaloguj się teraz
            </Button>
          </motion.div>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Zresetuj swoje hasło" subtitle="Wprowadź nowe hasło poniżej">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">Nowe hasło</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Wprowadź nowe hasło"
                      type={showPassword ? 'text' : 'password'}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">Potwierdź nowe hasło</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Potwierdź nowe hasło"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
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
                  <Turnstile onSuccess={handleTurnstileVerify} onError={handleTurnstileError} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              type="submit"
              className="w-full bg-amber-600 text-white transition-colors hover:bg-amber-700"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aktualizowanie hasła...
                </>
              ) : (
                'Zaktualizuj hasło'
              )}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Pamiętasz hasło? </span>
              <Link
                href={APP_ROUTES.LOGIN}
                className="text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
              >
                Zaloguj się
              </Link>
            </div>
          </motion.div>
        </form>
      </Form>
    </AuthLayout>
  )
}

export default ResetPasswordForm
