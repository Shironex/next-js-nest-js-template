'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import Link from 'next/link'
import { useRegister } from '../hooks/use-register'
import { SignupFormData, signupSchema } from '../utils/validation'
import AuthLayout from './aut-layout'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import PasswordStrength from '@/components/password-strenght'
import { motion } from 'framer-motion'
import usePasswordDebounce from '../hooks/use-password-debounce'
import { Turnstile } from '@/components/turnstile'
import { useRouter } from 'next/navigation'
import { APP_ROUTES } from '@/lib/constants'

const SignUpForm = () => {
  const router = useRouter()
  const register = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Use debounced password for strength indicator
  const { debouncedValue: passwordForStrength, updateValue: updatePasswordForStrength } =
    usePasswordDebounce('', 150)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      turnstileToken: '',
    },
  })

  // Memoize turnstile handlers to prevent re-renders
  const handleTurnstileVerify = useCallback(
    (token: string) => {
      form.setValue('turnstileToken', token)
    },
    [form],
  )

  const handleTurnstileError = useCallback(() => {
    form.setValue('turnstileToken', '')
  }, [form])

  const onSubmit = async (data: SignupFormData) => {
    const { confirmPassword, ...rest } = data
    register.mutate(rest, {
      onSuccess: () => {
        form.reset()
        router.push(APP_ROUTES.LOGIN)
      },
    })
  }

  return (
    <AuthLayout
      title="Utwórz konto"
      subtitle="Dołącz do nas, aby rozpocząć rezerwację unikalnych mebli"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa użytkownika</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Wprowadź swoją nazwę użytkownika"
                    autoComplete="name"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres e-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Wprowadź swój adres e-mail "
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasło</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Utwórz hasło"
                      autoComplete="new-password"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        updatePasswordForStrength(e.target.value)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
                <PasswordStrength password={passwordForStrength} />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potwierdź hasło</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me & Forgot Password */}
          <motion.div
            className="flex items-center justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
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
          </motion.div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={register.isPending}
            className="w-full bg-amber-600 py-3 text-base font-semibold text-white hover:bg-amber-700"
          >
            {register.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Utwórz konto'}
          </Button>
        </form>
      </Form>

      {/* Sign In Link */}
      <motion.div
        className="mt-8 border-t border-gray-200 pt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-gray-600">
          Masz konto?{' '}
          <Link href="/auth/login" className="font-medium text-amber-600 hover:text-amber-700">
            Zaloguj się
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}

export default SignUpForm
