import { LoginForm } from "@/components/login-form"
import { BrandPanel } from "@/components/brand-panel"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Panel - Brand Section */}
        <BrandPanel />

        {/* Right Panel - Login Form */}
        <div className="flex items-center justify-center p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
