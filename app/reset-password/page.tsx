import { BrandPanel } from "@/components/brand-panel"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center p-8 bg-background">
        <ResetPasswordForm />
      </div>
    </div>
  )
}