"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, AlertTriangle, Loader2, Check, X } from "lucide-react" // ADDED: Check, X icons
import Link from "next/link"
import api from "@/lib/api"
import axios from "axios"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // ADDED: Password strength validation state (FIX #26)
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  // ADDED: Validate password strength on change (FIX #26)
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordChecks({
      minLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    })
  }

  // ADDED: Check if password meets all requirements (FIX #26)
  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    // ADDED: Frontend validation (FIX #26)
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
        // ADDED: Handle detailed password validation errors from backend (FIX #26)
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

  return (
    <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in-up">
      <CardHeader className="space-y-4 text-center pb-8">
        <CardTitle className="text-3xl font-bold text-card-foreground tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground text-base leading-relaxed">
          Start your journey with FinSight AI by creating a new account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-lg text-sm">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-green-500/10 text-green-500 border border-green-500/20 p-3 rounded-lg text-sm">
              <p>{success}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)} 
              required
              disabled={isLoading}
            />
            
            {/* ADDED: Password strength indicators (FIX #26) */}
            {password.length > 0 && (
              <div className="space-y-2 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  {passwordChecks.minLength ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordChecks.minLength ? "text-green-500" : "text-muted-foreground"}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordChecks.hasUppercase ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordChecks.hasUppercase ? "text-green-500" : "text-muted-foreground"}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordChecks.hasNumber ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordChecks.hasNumber ? "text-green-500" : "text-muted-foreground"}>
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordChecks.hasSpecial ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordChecks.hasSpecial ? "text-green-500" : "text-muted-foreground"}>
                    One special character (!@#$%^&*...)
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isPasswordValid} 
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {"Already have an account? "}
          <Link href="/" className="text-primary hover:underline font-semibold">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}