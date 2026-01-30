"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, ArrowRight, AlertTriangle, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import axios from "axios"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      })

      if (response.status === 200) {
        const { access_token, refresh_token } = response.data.data
        localStorage.setItem("access_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("offline") || err.message.includes("internet connection")) {
          setError("You are offline. Please check your internet connection.")
        } else if (err.message.includes("timeout") || err.message.includes("timed out")) {
          setError("Request timed out. Please try again.")
        } else if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 429) {
            setError("Too many login attempts. Please try again later.")
          } else if (err.response.status === 401) {
            setError("Invalid email or password.")
          } else {
            setError(err.response.data?.data?.message || "Login failed. Please try again.")
          }
        } else {
          setError("An unexpected error occurred.")
        }
      } else {
        setError("An unexpected error occurred.")
      }
      console.error("Login failed:", err)
    } finally {
      setIsLoading(false)
    }
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
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground leading-relaxed">
          Sign in to continue tracking your expenses intelligently
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

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-primary" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-transition mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Create one
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}