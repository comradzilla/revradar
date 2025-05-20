"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function BootstrapAdminPage() {
  const [email, setEmail] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First check/create the execute_sql function
      await fetch("/api/bootstrap-admin", {
        method: "GET",
      })

      // Then set the admin user
      const response = await fetch("/api/bootstrap-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, secretKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set admin user")
      }

      toast({
        title: "Success!",
        description: data.message,
      })

      setIsComplete(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Bootstrap Admin User</CardTitle>
          <CardDescription>Set up the first admin user for your application</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Enter the email of the user you want to make an admin</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Enter your MIGRATION_SECRET_KEY</p>
            </div>
            {isComplete && (
              <div className="p-3 bg-green-900/20 border border-green-800 rounded-md text-green-400">
                Admin user set successfully! You can now{" "}
                <a href="/login" className="underline">
                  log in
                </a>{" "}
                and access the admin pages.
              </div>
            )}
            <div className="pt-2">
              <p className="text-sm text-gray-400">
                Having trouble? Try the{" "}
                <Link href="/bootstrap-admin/sql-script" className="text-blue-500 hover:underline">
                  manual SQL method
                </Link>{" "}
                instead.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || isComplete} className="w-full">
              {isLoading ? "Setting Admin..." : isComplete ? "Admin Set" : "Set Admin User"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
