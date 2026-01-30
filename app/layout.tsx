import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "sonner"
import './globals.css'

export const metadata: Metadata = {
  title: "FinSight AI - Intelligent Expense Tracking",
  description: "Intelligent Expense Tracking, Simplified.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster 
          position="top-right" 
          richColors 
          toastOptions={{
            className: 'border-border/50 bg-card/95 backdrop-blur-xl',
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}