import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    // Try to insert and then delete a test record to check permissions
    const testId = `test-${Date.now()}`

    // Insert test category
    const { error: insertError } = await supabaseAdmin.from("categories").insert({
      id: testId,
      name: "Test Category",
      created_by: "system",
    })

    if (insertError) {
      return NextResponse.json(
        {
          error: "Permission check failed: Cannot insert test record",
          details: insertError.message,
        },
        { status: 500 },
      )
    }

    // Delete the test category
    const { error: deleteError } = await supabaseAdmin.from("categories").delete().eq("id", testId)

    if (deleteError) {
      return NextResponse.json(
        {
          error: "Permission check failed: Cannot delete test record",
          details: deleteError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "Permission check passed",
    })
  } catch (error: any) {
    console.error("Permission check error:", error)
    return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 })
  }
}
