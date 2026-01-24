"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import axios from "axios"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email,
      })

      if (response.status === 200) {
        setSuccess("If an account exists with that email, a reset link has been sent. Please check your inbox.")
        setEmail("") // Clear the input
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.data.message || "Failed to send reset email. Please try again.")
      } else {
        setError("An unexpected error occurred.")
      }
      console.error("Forgot password failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in-up">
      <CardHeader className="space-y-4 text-center pb-8">
        <CardTitle className="text-3xl font-bold text-card-foreground tracking-tight">Forgot Password?</CardTitle>
        <CardDescription className="text-muted-foreground text-base leading-relaxed">
          Enter your email address and we'll send you a link to reset your password
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
              <CheckCircle2 className="h-5 w-5" />
              <p>{success}</p>
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
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-105 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
          >
            Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}