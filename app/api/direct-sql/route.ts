/**
 * Direct SQL Execution API Route
 * 
 * This route allows executing SQL statements directly against the database.
 * It requires a secret key for security and is intended for admin operations only.
 */
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role to bypass RLS policies
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    const { query, secretKey } = await request.json()

    // Verify secret key for security
    if (!secretKey || secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!query) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    // Execute the SQL directly using the REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("SQL execution error:", errorText)
      return NextResponse.json({ error: `Error executing SQL: ${errorText}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error in direct-sql:", error)
    return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 })
  }
}
