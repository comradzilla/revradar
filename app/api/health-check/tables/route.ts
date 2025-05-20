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

    // Check if required tables exist
    const requiredTables = ["categories", "subcategories", "prompts", "prompt_analytics"]
    const tableChecks = await Promise.all(
      requiredTables.map(async (table) => {
        const { data, error } = await supabaseAdmin.from(table).select("count(*)").limit(1).single()

        return {
          table,
          exists: !error,
          error: error ? error.message : null,
        }
      }),
    )

    const missingTables = tableChecks.filter((check) => !check.exists)

    if (missingTables.length > 0) {
      return NextResponse.json(
        {
          error: "Missing tables detected",
          missingTables,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "All required tables exist",
      tables: tableChecks,
    })
  } catch (error: any) {
    console.error("Table check error:", error)
    return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 })
  }
}
