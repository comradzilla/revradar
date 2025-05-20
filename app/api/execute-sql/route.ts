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
    const { sql, secretKey } = await request.json()

    // Verify secret key for security
    if (!secretKey || secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!sql) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    // First, try to create the execute_sql function if it doesn't exist
    try {
      await supabaseAdmin.rpc("execute_sql", { sql_query: "SELECT 1" })
    } catch (functionError) {
      // Function doesn't exist, create it
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          EXECUTE sql_query;
          result := '{"success": true}'::JSONB;
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
          );
          RETURN result;
        END;
        $$;
      `

      // Execute the create function query directly using REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({ sql_query: createFunctionQuery }),
      })

      if (!response.ok) {
        // If we can't create the function, try a direct approach
        const directResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ query: sql }),
        })

        if (!directResponse.ok) {
          return NextResponse.json(
            { error: "Could not execute SQL. Function creation failed and direct query failed." },
            { status: 500 },
          )
        }

        return NextResponse.json({ success: true })
      }
    }

    // Now execute the SQL using the function
    const { data, error } = await supabaseAdmin.rpc("execute_sql", { sql_query: sql })

    if (error) {
      return NextResponse.json({ error: `Error executing SQL: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 })
  }
}
