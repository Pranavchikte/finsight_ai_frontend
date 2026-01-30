"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, AlertTriangle, Loader2, Check, X, Sparkles } from "lucide-react"
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
  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-border"
    if (passwordStrength <= 2) return "bg-destructive"
    if (passwordStrength === 3) return "bg-warning"
    return "bg-success"
  }

  return (
    <Card className="w-full max-w-lg border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl animate-scale-in">
      <CardHeader className="space-y-3 text-center pb-6 border-b border-border/50">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-ai-accent/20 flex items-center justify-center border border-primary/30">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground leading-relaxed">
          Start your journey with FinSight AI
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-destructive/10 text-destructive border border-destructive/30 p-4 rounded-lg text-sm animate-shake">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-start gap-3 bg-success/10 text-success border border-success/30 p-4 rounded-lg text-sm animate-fade-in">
              <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">{success}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
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
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            
            {/* Password Strength Bar */}
            {password.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        getStrengthColor()
                      )}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium min-w-[60px]">
                    {passwordStrength === 0 && "Weak"}
                    {passwordStrength === 1 && "Weak"}
                    {passwordStrength === 2 && "Fair"}
                    {passwordStrength === 3 && "Good"}
                    {passwordStrength === 4 && "Strong"}
                  </span>
                </div>

                {/* Password Requirements Checklist */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {passwordChecks.minLength ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    <span className={cn(
                      "transition-colors",
                      passwordChecks.minLength ? "text-success font-medium" : "text-muted-foreground"
                    )}>
                      8+ characters
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {passwordChecks.hasUppercase ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    <span className={cn(
                      "transition-colors",
                      passwordChecks.hasUppercase ? "text-success font-medium" : "text-muted-foreground"
                    )}>
                      Uppercase
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {passwordChecks.hasNumber ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    <span className={cn(
                      "transition-colors",
                      passwordChecks.hasNumber ? "text-success font-medium" : "text-muted-foreground"
                    )}>
                      Number
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {passwordChecks.hasSpecial ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    <span className={cn(
                      "transition-colors",
                      passwordChecks.hasSpecial ? "text-success font-medium" : "text-muted-foreground"
                    )}>
                      Special char
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-transition mt-6"
            disabled={isLoading || !isPasswordValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
          Already have an account?{" "}
          <Link href="/" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}