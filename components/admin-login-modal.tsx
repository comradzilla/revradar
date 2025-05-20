"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export function AdminLoginModal({ isOpen, onClose, onLogin }: AdminLoginModalProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = () => {
    setIsLoading(true)

    // Simple password check - in a real app, this would be a secure API call
    setTimeout(() => {
      if (password === "pizzaparty") {
        toast({
          description: "Admin access granted",
        })
        onLogin()
        setPassword("")
      } else {
        toast({
          variant: "destructive",
          description: "Invalid password",
        })
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
          <DialogDescription>Enter the admin password to access editing features.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0D0D0D] border-[#2E2E2E]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin()
              }
            }}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-[#3A9D42] hover:bg-[#2E8B57] text-[#0D0D0D]"
            >
              {isLoading ? "Verifying..." : "Login"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
