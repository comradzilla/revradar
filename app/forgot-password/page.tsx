import { Header } from "@/components/header"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <ForgotPasswordForm />
      </main>
    </div>
  )
}
