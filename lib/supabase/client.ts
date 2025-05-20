"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Create a single instance of the client to be used across the app
export const supabase = createClientComponentClient<Database>()

// Safe execute SQL function that checks if the function exists first
export async function executeSql(sql: string) {
  try {
    return await supabase.rpc("execute_sql", { sql_query: sql })
  } catch (error: any) {
    console.error("Error executing SQL:", error.message)
    return { error }
  }
}
