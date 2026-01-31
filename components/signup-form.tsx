"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2, Check, X, Sparkles, UserPlus, Mail, Lock } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import axios from "axios"
import { cn } from "@/lib/utils"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordChecks({
      minLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    })
  }

  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    if (!isPasswordValid) {
      setError("Please meet all password requirements before submitting.")
      setIsLoading(false)
      return
    }

    try {
      const response = await api.post("/auth/register", {
        email: email,
        password: password,
      })

      if (response.status === 201) {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data?.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const passwordError = Array.isArray(errorData) 
            ? errorData.find((e: any) => e.loc?.includes('password'))
            : null;
          
          if (passwordError && passwordError.msg) {
            setError(passwordError.msg);
          } else if (err.response.status === 409) {
            setError("A user with this email already exists.")
          } else {
            setError(err.response.data?.message || "Registration failed. Please try again.")
          }
        } else if (err.response.status === 409) {
          setError("A user with this email already exists.")
        } else {
          setError("Registration failed. Please try again.")
        }
      } else {
        setError("An unexpected error occurred.")
      }
      console.error("Registration failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
              <UserPlus className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-purple-500 rounded-full border-4 border-background flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Get Started Free
          </h1>
          <p className="text-muted-foreground text-lg">
            Start tracking expenses with AI
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-xl animate-shake">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="flex items-start gap-3 bg-green-500/10 text-green-500 border border-green-500/20 p-4 rounded-xl">
            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 text-base bg-muted/50 border-2 focus:border-green-500 focus:ring-4 focus:ring-green-500/20"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)} 
              required
              disabled={isLoading}
              className="h-12 text-base bg-muted/50 border-2 focus:border-green-500 focus:ring-4 focus:ring-green-500/20"
            />
            
            {/* Password Requirements */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center gap-1.5">
                  {passwordChecks.minLength ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={cn(
                    "text-xs transition-colors",
                    passwordChecks.minLength ? "text-green-500 font-semibold" : "text-muted-foreground"
                  )}>
                    8+ characters
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {passwordChecks.hasUppercase ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={cn(
                    "text-xs transition-colors",
                    passwordChecks.hasUppercase ? "text-green-500 font-semibold" : "text-muted-foreground"
                  )}>
                    Uppercase
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {passwordChecks.hasNumber ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={cn(
                    "text-xs transition-colors",
                    passwordChecks.hasNumber ? "text-green-500 font-semibold" : "text-muted-foreground"
                  )}>
                    Number
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {passwordChecks.hasSpecial ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={cn(
                    "text-xs transition-colors",
                    passwordChecks.hasSpecial ? "text-green-500 font-semibold" : "text-muted-foreground"
                  )}>
                    Special char
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all"
          disabled={isLoading || !isPasswordValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/" className="text-green-500 hover:text-green-600 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}