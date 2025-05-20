/**
 * Direct SQL Execution API Route
 * 
 * This route allows executing SQL statements directly against the database.
 * It requires a secret key for security and is intended for admin operations only.
 */
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// The admin client will be created inside the handler function to ensure environment variables are available at runtime

export async function POST(request: Request) {
  try {
    // Initialize Supabase admin client inside the handler function
    // This ensures environment variables are available at runtime
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    
    const { query, secretKey } = await request.json()

    // Verify secret key for security
    const adminSecretKey = process.env.BOOTSTRAP_ADMIN_SECRET_KEY || process.env.MIGRATION_SECRET_KEY
    if (!secretKey || secretKey !== adminSecretKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Verify Supabase connection
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 })
    }

    if (!query) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    // First try to execute the SQL using the RPC method
    try {
      const { error: rpcError } = await supabaseAdmin.rpc('execute_sql', { query })
      
      if (rpcError) {
        throw new Error(`RPC error: ${rpcError.message}`)
      }
      
      return NextResponse.json({ success: true })
    } catch (rpcErr) {
      console.log("RPC method failed, falling back to REST API:", rpcErr)
      
      try {
        // Fallback: Execute the SQL directly using the REST API
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
          body: JSON.stringify({ query }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("SQL execution error:", errorText)
          return NextResponse.json({ error: `Error executing SQL: ${errorText}` }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      } catch (fetchErr: any) {
        console.error("Fetch error:", fetchErr)
        return NextResponse.json({ error: `Error executing SQL via fetch: ${fetchErr.message}` }, { status: 500 })
      }
    }
  } catch (error: any) {
    console.error("Unexpected error in direct-sql:", error)
    return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 })
  }
}
