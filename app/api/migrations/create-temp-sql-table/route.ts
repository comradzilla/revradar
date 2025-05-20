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

    // Create a temporary table for SQL execution
    const createTableSql = `
    CREATE TABLE IF NOT EXISTS temp_sql_execution (
      id INTEGER PRIMARY KEY,
      sql TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create an RPC function to execute SQL from the temp table
    CREATE OR REPLACE FUNCTION execute_temp_sql(temp_id INTEGER)
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      sql_to_execute TEXT;
    BEGIN
      SELECT sql INTO sql_to_execute FROM temp_sql_execution WHERE id = temp_id;
      EXECUTE sql_to_execute;
    END;
    $$;
    
    -- Create a function to create the temp table itself
    CREATE OR REPLACE FUNCTION create_temp_sql_table()
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS temp_sql_execution (
        id INTEGER PRIMARY KEY,
        sql TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END;
    $$;
    `

    // Try to create the table directly using a simple insert
    const { error: insertError } = await supabase
      .from('temp_sql_execution')
      .insert({ id: 0, sql: createTableSql })
      .select()
      .single()

    if (insertError) {
      // Table might not exist yet, let's try to create it using a different approach
      // Use the service role client to execute the SQL directly via the REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_temp_sql_table`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        // If that fails too, we need to create the function first
        const createFunctionResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({ query: createTableSql })
        });
        
        if (!createFunctionResponse.ok) {
          const errorText = await createFunctionResponse.text();
          return NextResponse.json({ error: `Failed to create temp SQL table: ${errorText}` }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating temp SQL table:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
