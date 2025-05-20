import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create the execute_sql function if it doesn't exist
    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;
    `

    const { error } = await supabase.rpc("execute_sql", { sql_query: createFunctionSql })

    if (error) {
      // If the function doesn't exist yet, create it directly
      const { error: directError } = await supabase.query(createFunctionSql)
      if (directError) throw directError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating execute_sql function:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
