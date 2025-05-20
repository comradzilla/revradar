import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Parse query parameters
  const url = new URL(request.url)
  const tableName = url.searchParams.get("table")
  const recordId = url.searchParams.get("record")
  const userId = url.searchParams.get("user")
  const limit = Number.parseInt(url.searchParams.get("limit") || "100")

  // Build query
  let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit)

  if (tableName) {
    query = query.eq("table_name", tableName)
  }

  if (recordId) {
    query = query.eq("record_id", recordId)
  }

  if (userId) {
    query = query.eq("user_id", userId)
  }

  // Execute query
  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
