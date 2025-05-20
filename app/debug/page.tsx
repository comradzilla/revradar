"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DebugPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const [dbStatus, setDbStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [tables, setTables] = useState<string[]>([])
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<string[]>([])
  const [adminActionResult, setAdminActionResult] = useState<string | null>(null)
  const [migrationKey, setMigrationKey] = useState<string>("")
  const [showKeyInput, setShowKeyInput] = useState(false)

  useEffect(() => {
    // Check for environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    setSupabaseUrl(url || null)

    // List available environment variables (just the names, not values)
    const vars = []
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) vars.push("NEXT_PUBLIC_SUPABASE_URL")
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) vars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (process.env.SUPABASE_URL) vars.push("SUPABASE_URL")
    if (process.env.SUPABASE_ANON_KEY) vars.push("SUPABASE_ANON_KEY")
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) vars.push("SUPABASE_SERVICE_ROLE_KEY")
    if (process.env.MIGRATION_SECRET_KEY) vars.push("MIGRATION_SECRET_KEY")
    setEnvVars(vars)
  }, [])

  const checkDatabase = async () => {
    setChecking(true)
    setError(null)

    try {
      // Check database connection
      const { data, error: pingError } = await supabase.from("_dummy_query_").select("*").limit(1)

      if (pingError && !pingError.message.includes("does not exist")) {
        setDbStatus("error")
        setError(`Database connection error: ${pingError.message}`)
      } else {
        setDbStatus("connected")

        // List tables
        try {
          // Try to get tables from information_schema
          const { data: schemaData, error: schemaError } = await supabase
            .from("information_schema.tables")
            .select("table_name")
            .eq("table_schema", "public")

          if (schemaError) {
            setError(`Error fetching tables: ${schemaError.message}`)
          } else if (schemaData) {
            setTables(schemaData.map((t: any) => t.table_name))
          }
        } catch (e: any) {
          setError(`Error fetching tables: ${e.message}`)
        }
      }
    } catch (e: any) {
      setDbStatus("error")
      setError(`Unexpected error: ${e.message}`)
    } finally {
      setChecking(false)
    }
  }

  const createProfilesTable = async () => {
    if (!migrationKey) {
      setShowKeyInput(true)
      return
    }

    setChecking(true)
    setError(null)
    setAdminActionResult(null)

    try {
      // First check if the table already exists
      const { data: schemaData, error: schemaError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "profiles")

      if (!schemaError && schemaData && schemaData.length > 0) {
        setAdminActionResult("Profiles table already exists")
        setChecking(false)
        return
      }

      // Create the profiles table using the direct SQL API
      const response = await fetch("/api/direct-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: `
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              is_admin BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can read their own profile" 
              ON public.profiles 
              FOR SELECT 
              USING (auth.uid() = id);
              
            CREATE POLICY "Users can update their own profile" 
              ON public.profiles 
              FOR UPDATE 
              USING (auth.uid() = id);
              
            CREATE POLICY "Admin users can read all profiles" 
              ON public.profiles 
              FOR SELECT 
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE id = auth.uid() AND is_admin = true
                )
              );
              
            CREATE POLICY "Admin users can update all profiles" 
              ON public.profiles 
              FOR UPDATE 
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE id = auth.uid() AND is_admin = true
                )
              );
          `,
          secretKey: migrationKey,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unknown error")
      }

      setAdminActionResult("Profiles table created successfully")
      await checkDatabase()
    } catch (e: any) {
      setError(`Error creating profiles table: ${e.message}`)
    } finally {
      setChecking(false)
    }
  }

  const makeUserAdmin = async () => {
    if (!user) {
      setError("You must be logged in to become an admin")
      return
    }

    if (!migrationKey) {
      setShowKeyInput(true)
      return
    }

    setChecking(true)
    setError(null)
    setAdminActionResult(null)

    try {
      // Use the create-admin API
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          secretKey: migrationKey,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unknown error")
      }

      setAdminActionResult("You are now an admin! Refreshing page in 3 seconds...")
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (e: any) {
      setError(`Error making user admin: ${e.message}`)
    } finally {
      setChecking(false)
    }
  }

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowKeyInput(false)

    if (user && !isAdmin) {
      makeUserAdmin()
    } else {
      createProfilesTable()
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Troubleshoot your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showKeyInput ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Enter Migration Secret Key</h3>
              <form onSubmit={handleKeySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="migrationKey">Migration Secret Key</Label>
                  <Input
                    id="migrationKey"
                    type="password"
                    value={migrationKey}
                    onChange={(e) => setMigrationKey(e.target.value)}
                    placeholder="Enter your MIGRATION_SECRET_KEY"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setShowKeyInput(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Authentication</h3>
                <div className="bg-gray-800 p-4 rounded-md">
                  <p>
                    <strong>Status:</strong> {isLoading ? "Loading..." : user ? "Authenticated" : "Not authenticated"}
                  </p>
                  {user && (
                    <>
                      <p>
                        <strong>User ID:</strong> {user.id}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                    </>
                  )}
                  <p>
                    <strong>Admin Status:</strong> {isAdmin ? "Admin" : "Not admin"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Environment</h3>
                <div className="bg-gray-800 p-4 rounded-md">
                  <p>
                    <strong>Supabase URL:</strong> {supabaseUrl || "Not set"}
                  </p>
                  <p>
                    <strong>Available Environment Variables:</strong>{" "}
                    {envVars.length > 0 ? envVars.join(", ") : "None detected"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Database</h3>
                <div className="bg-gray-800 p-4 rounded-md">
                  <p>
                    <strong>Status:</strong>{" "}
                    {dbStatus === "unknown"
                      ? "Not checked"
                      : dbStatus === "connected"
                        ? "Connected"
                        : "Connection error"}
                  </p>
                  {tables.length > 0 && (
                    <div>
                      <strong>Tables:</strong>
                      <ul className="list-disc pl-5 mt-1">
                        {tables.map((table) => (
                          <li key={table}>{table}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                  {adminActionResult && <p className="text-green-500 mt-2">{adminActionResult}</p>}
                </div>
              </div>
            </>
          )}
        </CardContent>
        {!showKeyInput && (
          <CardFooter className="flex flex-col space-y-2">
            <div className="flex gap-2 w-full">
              <Button onClick={checkDatabase} disabled={checking} className="flex-1">
                {checking ? "Checking..." : "Check Database"}
              </Button>
              <Button onClick={createProfilesTable} disabled={checking} className="flex-1">
                Create Profiles Table
              </Button>
            </div>
            {user && !isAdmin && (
              <Button onClick={makeUserAdmin} disabled={checking} className="w-full">
                Make Me Admin
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
