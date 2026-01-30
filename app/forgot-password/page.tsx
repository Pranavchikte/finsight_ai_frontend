import { BrandPanel } from "@/components/brand-panel"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center p-8 bg-background">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}