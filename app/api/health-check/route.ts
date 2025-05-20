import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role to bypass RLS policies
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabaseAdmin.from("_dummy_query_").select("*").limit(1)

    if (error && !error.message.includes("does not exist")) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
    }

    // List tables
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    const tables = tablesData?.map((t: any) => t.table_name) || []

    // Check for profiles table
    const hasProfilesTable = tables.includes("profiles")

    // Check for execute_sql function
    let hasExecuteSqlFunction = false
    try {
      const { data: funcData, error: funcError } = await supabaseAdmin.rpc("execute_sql", {
        sql_query: "SELECT 1",
      })
      hasExecuteSqlFunction = !funcError
    } catch (e) {
      // Function doesn't exist
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      tables,
      hasProfilesTable,
      hasExecuteSqlFunction,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasMigrationSecretKey: !!process.env.MIGRATION_SECRET_KEY,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}
