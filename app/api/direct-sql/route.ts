import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sql, secretKey } = await request.json()

    // Verify secret key for security
    if (!secretKey || secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!sql) {
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
      body: JSON.stringify({ query: sql }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Error executing SQL: ${errorText}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 })
  }
}
