"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type SeedingStatus = {
  isSeeded: boolean
  categoriesCount: number
  promptsCount: number
  categories: Array<{ id: string; name: string }>
}

export function SeedDatabase() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<SeedingStatus | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [forceReseed, setForceReseed] = useState(false)
  const { toast } = useToast()

  // Check if database is already seeded on component mount
  useEffect(() => {
    checkSeedingStatus()
  }, [])

  const checkSeedingStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/seed", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check seeding status")
      }

      setStatus(data)
      if (data.isSeeded) {
        setIsComplete(true)
      }
    } catch (error: any) {
      console.error("Error checking seeding status:", error)
      setError(error.message)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSeedDatabase = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force: forceReseed }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed database")
      }

      toast({
        title: "Database seeded successfully",
        description: data.message || "All categories, subcategories, and prompts have been added to the database.",
      })

      setIsComplete(true)
      // Check the status after seeding
      await checkSeedingStatus()
    } catch (error: any) {
      setError(error.message)
      toast({
        variant: "destructive",
        title: "Seeding failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="p-6 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Checking Database Status</h2>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <p className="text-gray-400">Checking if database has been seeded...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Seed Database</h2>
      <p className="mb-4 text-gray-400">
        This will populate your Supabase database with sample categories and prompts. Only use this once when setting up
        your application.
      </p>

      {status && (
        <div className="mb-6 p-4 bg-[#2A2A2A] rounded-md">
          <h3 className="text-lg font-medium mb-2">Database Status</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="mr-2">Categories:</span>
              <span className="font-mono">{status.categoriesCount}</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">Prompts:</span>
              <span className="font-mono">{status.promptsCount}</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">Status:</span>
              {status.isSeeded ? (
                <span className="text-green-500 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Seeded
                </span>
              ) : (
                <span className="text-yellow-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> Not seeded
                </span>
              )}
            </li>
          </ul>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-md text-red-400">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p className="font-mono text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {status && status.isSeeded && (
        <div className="mb-6 flex items-center space-x-2">
          <Switch id="force-reseed" checked={forceReseed} onCheckedChange={setForceReseed} />
          <Label htmlFor="force-reseed" className="text-gray-400">
            Force re-seed (will delete existing data)
          </Label>
        </div>
      )}

      {isComplete && !forceReseed ? (
        <div className="p-4 bg-green-900/20 border border-green-800 rounded-md text-green-400">
          Database seeded successfully! You can now refresh the page to see the data.
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={handleSeedDatabase}
            disabled={isLoading}
            className="bg-[#3A9D42] hover:bg-[#2E8B57] text-[#0D0D0D]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {forceReseed ? "Re-seeding Database..." : "Seeding Database..."}
              </>
            ) : forceReseed ? (
              "Force Re-seed Database"
            ) : (
              "Seed Database"
            )}
          </Button>

          <Button onClick={checkSeedingStatus} variant="outline" disabled={isLoading || isChecking} className="ml-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Status
          </Button>
        </div>
      )}
    </div>
  )
}
