"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DatabaseTroubleshooter() {
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<Record<string, boolean | null>>({
    connection: null,
    tables: null,
    permissions: null,
  })
  const { toast } = useToast()

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/health-check", {
        method: "GET",
      })
      return response.ok
    } catch (error) {
      console.error("Connection check failed:", error)
      return false
    }
  }

  const checkTables = async () => {
    try {
      const response = await fetch("/api/health-check/tables", {
        method: "GET",
      })
      return response.ok
    } catch (error) {
      console.error("Tables check failed:", error)
      return false
    }
  }

  const checkPermissions = async () => {
    try {
      const response = await fetch("/api/health-check/permissions", {
        method: "GET",
      })
      return response.ok
    } catch (error) {
      console.error("Permissions check failed:", error)
      return false
    }
  }

  const runDiagnostics = async () => {
    setIsChecking(true)
    setResults({
      connection: null,
      tables: null,
      permissions: null,
    })

    try {
      // Check database connection
      const connectionResult = await checkConnection()
      setResults((prev) => ({ ...prev, connection: connectionResult }))

      // If connection is successful, check tables
      if (connectionResult) {
        const tablesResult = await checkTables()
        setResults((prev) => ({ ...prev, tables: tablesResult }))

        // If tables check is successful, check permissions
        if (tablesResult) {
          const permissionsResult = await checkPermissions()
          setResults((prev) => ({ ...prev, permissions: permissionsResult }))
        }
      }

      toast({
        title: "Diagnostics complete",
        description: "Check the results below for any issues.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Diagnostics failed",
        description: error.message || "An unknown error occurred",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-5 h-5 rounded-full bg-gray-500" />
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Database Diagnostics</h3>
      <p className="text-gray-400">
        If you're having trouble seeding the database, run these diagnostics to identify potential issues.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-md">
          <span>Database Connection</span>
          {getStatusIcon(results.connection)}
        </div>
        <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-md">
          <span>Tables Structure</span>
          {getStatusIcon(results.tables)}
        </div>
        <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-md">
          <span>RLS Permissions</span>
          {getStatusIcon(results.permissions)}
        </div>
      </div>

      <Button onClick={runDiagnostics} disabled={isChecking} variant="outline" className="w-full">
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Diagnostics...
          </>
        ) : (
          "Run Diagnostics"
        )}
      </Button>

      {Object.values(results).some((result) => result === false) && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-md text-red-400">
          <h4 className="font-medium mb-2">Issues Detected</h4>
          <ul className="list-disc list-inside space-y-1">
            {results.connection === false && (
              <li>Database connection failed. Check your Supabase URL and anon key in your environment variables.</li>
            )}
            {results.tables === false && (
              <li>
                Table structure issues detected. Try running the manual SQL script to create the necessary tables.
              </li>
            )}
            {results.permissions === false && (
              <li>
                Permission issues detected. Make sure you're using the service role key for seeding and that your RLS
                policies are correctly configured.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
