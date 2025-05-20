"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase/client"

export function DebugInfo() {
  const { user, isAdmin, isLoading } = useAuth()
  const [showDebug, setShowDebug] = useState(false)
  const [dbStatus, setDbStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [profilesTableExists, setProfilesTableExists] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDatabase = async () => {
    setChecking(true)
    setError(null)

    try {
      // Check database connection
      const { data, error: pingError } = await supabase.from("_test_connection").select("*").limit(1).single()

      if (pingError && !pingError.message.includes("does not exist")) {
        setDbStatus("error")
        setError(`Database connection error: ${pingError.message}`)
      } else {
        setDbStatus("connected")

        // Check if profiles table exists
        try {
          const { data: profileData, error: profileError } = await supabase.from("profiles").select("id").limit(1)

          if (profileError && profileError.message.includes("does not exist")) {
            setProfilesTableExists(false)
          } else {
            setProfilesTableExists(true)
          }
        } catch (e: any) {
          setError(`Error checking profiles table: ${e.message}`)
        }
      }
    } catch (e: any) {
      setDbStatus("error")
      setError(`Unexpected error: ${e.message}`)
    } finally {
      setChecking(false)
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)}>
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between">
            Debug Information
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowDebug(false)}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>Auth Status:</strong> {isLoading ? "Loading..." : user ? "Authenticated" : "Not authenticated"}
          </div>
          {user && (
            <>
              <div>
                <strong>User ID:</strong> {user.id}
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
            </>
          )}
          <div>
            <strong>Admin Status:</strong> {isAdmin ? "Admin" : "Not admin"}
          </div>
          <div>
            <strong>Database:</strong>{" "}
            {dbStatus === "unknown" ? "Not checked" : dbStatus === "connected" ? "Connected" : "Connection error"}
          </div>
          {profilesTableExists !== null && (
            <div>
              <strong>Profiles Table:</strong> {profilesTableExists ? "Exists" : "Does not exist"}
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          <Button size="sm" variant="outline" className="w-full mt-2" onClick={checkDatabase} disabled={checking}>
            {checking ? "Checking..." : "Check Database"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
