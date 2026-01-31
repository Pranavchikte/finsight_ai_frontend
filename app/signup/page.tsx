import { BrandPanel } from "@/components/brand-panel"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <div className="w-full max-w-lg">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}