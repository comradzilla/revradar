"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"

export default function SetupInitPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const router = useRouter()

  const initializeSetup = async () => {
    setIsLoading(true)

    try {
      // First create the execute_sql function
      const response = await fetch("/api/migrations/create-execute-sql-function", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize setup")
      }

      toast({
        title: "Setup initialized",
        description: "You can now proceed to the main setup page.",
      })

      setIsComplete(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup initialization failed",
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
          <CardTitle>Initialize Setup</CardTitle>
          <CardDescription>This will prepare your database for the enhanced permissions setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-4">
            This is a one-time initialization step that creates the necessary database functions.
          </p>
          {isComplete && (
            <div className="p-3 bg-green-900/20 border border-green-800 rounded-md text-green-400 mt-4">
              Initialization completed successfully! You can now proceed to the{" "}
              <a href="/admin/setup" className="underline">
                main setup page
              </a>
              .
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={initializeSetup} disabled={isLoading || isComplete} className="w-full">
            {isLoading ? "Initializing..." : isComplete ? "Initialization Complete" : "Initialize Setup"}
          </Button>
          {isComplete && (
            <Button onClick={() => router.push("/admin/setup")} className="w-full ml-2">
              Go to Setup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
