"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, ArrowRight, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import axios from "axios" // Import axios to check for API errors

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
        // --- KEY CHANGE 1: Store BOTH tokens ---
        // The data is now inside response.data.data due to our standardized response
        const { access_token, refresh_token } = response.data.data
        localStorage.setItem("access_token", access_token)
        localStorage.setItem("refresh_token", refresh_token) // Store the refresh token
        router.push("/dashboard")
        // ----------------------------------------
      }
    } catch (err: unknown) {
      // --- KEY CHANGE 2: Handle standardized errors ---
      if (axios.isAxiosError(err) && err.response) {
        // Extract the specific error message from our standardized API response
        setError(err.response.data.data.message || "An unexpected error occurred.")
      } else {
        setError("An unexpected error occurred.")
      }
      console.error("Login failed:", err)
      // -----------------------------------------------
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in-up">
      <CardHeader className="space-y-4 text-center pb-8">
        <CardTitle className="text-3xl font-bold text-card-foreground tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground text-base leading-relaxed">
          Sign in to your FinSight AI account and continue tracking your expenses intelligently
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
          <div className="space-y-3">
            <Label htmlFor="email" className="text-card-foreground font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-input/50 border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl transition-all duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="text-card-foreground font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-input/50 border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl transition-all duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-105 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Login
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
        <div className="text-center space-y-6">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
          >
            Forgot your password?
          </Link>
          <div className="text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/signup"
              className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}