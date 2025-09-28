// app/signup/page.tsx
import { BrandPanel } from "@/components/brand-panel"
import { SignupForm } from "@/components/signup-form" // We will create this next

export default function SignupPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center p-8 bg-card/20">
        <SignupForm />
      </div>
    </div>
  )
}