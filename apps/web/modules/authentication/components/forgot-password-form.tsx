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
      <AuthLayout
        title="Sprawdź swoją skrzynkę email"
        subtitle="Wysłaliśmy Ci link do resetowania hasła"
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
              Link do resetowania hasła został wysłany!
            </h3>
            <p className="mb-6 text-gray-600">
              Sprawdź swoją skrzynkę email i postępuj zgodnie z instrukcjami, aby zresetować hasło.
              Link wygaśnie za 1 godzinę.
            </p>

            <div className="space-y-3">
              <Button onClick={() => setEmailSent(false)} variant="outline" className="w-full">
                Wyślij ponownie
              </Button>

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

  return (
    <AuthLayout
      title="Zapomniałeś hasła?"
      subtitle="Wpisz swój email, a wyślemy Ci link do resetowania"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">Adres email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Wprowadź swój adres email"
                      type="email"
                      className="pl-10"
                      {...field}
                    />
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
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie linku...
                </>
              ) : (
                'Wyślij link resetujący'
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

export default ForgotPasswordForm
