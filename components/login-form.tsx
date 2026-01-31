"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, AlertTriangle, Loader2, Sparkles } from "lucide-react"
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
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome Back!
          </h1>
          <p className="text-muted-foreground text-lg">
            Sign in to continue your journey
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

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base bg-muted/50 border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500" />
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base bg-muted/50 border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}