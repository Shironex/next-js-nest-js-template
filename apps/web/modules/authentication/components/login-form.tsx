'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { SigninFormData, signinSchema } from '../utils/validation'
import { useLogin } from '../hooks/use-login'
import { APP_ROUTES } from '@/lib/constants'
import AuthLayout from './aut-layout'
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

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()
  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
      turnstileToken: '',
    },
  })

  const onSubmit = async (data: SigninFormData) => {
    login.mutate(data, {
      onSuccess: () => form.reset(),
    })
  }

  const handleTurnstileVerify = (token: string) => {
    form.setValue('turnstileToken', token)
  }

  const handleTurnstileError = () => {
    form.setValue('turnstileToken', '')
  }

  return (
    <AuthLayout title="Witaj spowrotem" subtitle="Zaloguj się aby skorzystać z naszej strony">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      autoFocus
                      className="transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="pr-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                        {...field}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Forgot Password */}
          <motion.div
            className="flex items-center justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href={APP_ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
            >
              Zapomniałeś hasła?
            </Link>
          </motion.div>

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

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full transform bg-amber-600 py-3 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-amber-700"
            >
              {login.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Zaloguj się'}
            </Button>
          </motion.div>
        </form>
      </Form>

      {/* Sign Up Link */}
      <motion.div
        className="mt-8 border-t border-gray-200 pt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-gray-600">
          Nie masz konta?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-amber-600 transition-colors hover:text-amber-700"
          >
            Zarejestruj się
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}

export default LoginForm
