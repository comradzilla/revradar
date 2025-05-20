"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const router = useRouter()

  const runMigration = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/migrations/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run migration")
      }

      toast({
        title: "Migration completed",
        description: "The database schema has been updated successfully.",
      })

      setIsComplete(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Migration failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>You need admin privileges to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Permissions Setup</CardTitle>
          <CardDescription>
            This will update your database schema to support enhanced permissions, roles, and audit logging.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-4">This operation will:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-400">
            <li>Add ownership tracking to content</li>
            <li>Create role-based access control</li>
            <li>Set up audit logging</li>
            <li>Implement content approval workflow</li>
          </ul>
          {isComplete && (
            <div className="p-3 bg-green-900/20 border border-green-800 rounded-md text-green-400 mt-4">
              Migration completed successfully! You can now use the enhanced permission system.
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={runMigration}
            disabled={isLoading || isComplete}
            className="w-full bg-[#3A9D42] hover:bg-[#2E8B57] text-[#0D0D0D]"
          >
            {isLoading ? "Running Migration..." : isComplete ? "Migration Complete" : "Run Migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
