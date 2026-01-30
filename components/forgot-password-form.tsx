// forgot-password-form.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, AlertTriangle, Loader2, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react"
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
        setEmail("")
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
    <Card className="w-full max-w-lg border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl animate-scale-in">
      <CardHeader className="space-y-3 text-center pb-6 border-b border-border/50">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-ai-accent/20 flex items-center justify-center border border-primary/30">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          Forgot Password?
        </CardTitle>
        <CardDescription className="text-muted-foreground leading-relaxed">
          Enter your email address and we'll send you a link to reset your password
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
              <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">{success}</p>
            </div>
          )}

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

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-transition mt-6"
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
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-border/50">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}