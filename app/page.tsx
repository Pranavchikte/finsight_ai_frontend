import { LoginForm } from "@/components/login-form"
import { BrandPanel } from "@/components/brand-panel"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <LoginForm />
      </div>
    </div>
  )
}