import { Header } from "@/components/header"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <SignupForm />
      </main>
    </div>
  )
}
