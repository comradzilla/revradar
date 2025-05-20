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
    // We'll use a stored procedure approach that's compatible with Supabase
    
    // First, check if the function already exists
    const { data: functionExists, error: checkError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'execute_sql')
      .maybeSingle();
    
    if (checkError) {
      console.log("Error checking if function exists, will try to create it anyway:", checkError);
    }
    
    // Create the execute_sql function directly using a service role client
    // This is a more reliable approach for Vercel deployment
    
    // Create the function definition
    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION execute_sql(query TEXT)
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
    `;
    
    try {
      // Use the service role client to execute the SQL directly via the REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
      }
      
      // First try to call our migration endpoint that creates the temp table
      const migrationResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/migrations/create-temp-sql-table`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      
      if (!migrationResponse.ok) {
        console.error("Error calling migration endpoint, trying direct approach");
        
        // If that fails, try direct REST API call
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({ query: createFunctionSql })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create function: ${errorText}`);
        }
      }
    } catch (error: any) {
      console.error("Error creating execute_sql function:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating execute_sql function:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
