import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role to bypass RLS policies
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Bootstrap Admin API Route
 * 
 * This API route is used to set up the initial admin user in the system.
 * It requires a secret key for security and the email of the user to be made admin.
 */
export async function POST(request: Request) {
  try {
    const { email, secretKey } = await request.json()

    // Verify secret key for security
    const adminSecretKey = process.env.BOOTSTRAP_ADMIN_SECRET_KEY || process.env.MIGRATION_SECRET_KEY
    if (!secretKey || secretKey !== adminSecretKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if user exists by listing all users and finding the one with matching email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: `Error listing users: ${listError.message}` }, { status: 500 })
    }

    if (!users || !users.users || users.users.length === 0) {
      return NextResponse.json({ error: "No users found in the system" }, { status: 404 })
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found with the provided email" }, { status: 404 })
    }

    // Check if profiles table exists and has the expected columns
    let tableExists = true
    let hasExpectedColumns = true
    
    const { error: tableCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id, is_admin, created_at, updated_at")
      .limit(1)

    if (tableCheckError) {
      if (tableCheckError.message.includes("does not exist")) {
        tableExists = false
      } else if (tableCheckError.message.includes("column") && tableCheckError.message.includes("does not exist")) {
        hasExpectedColumns = false
      }
    }

    // Create or alter profiles table if it doesn't exist or doesn't have the expected columns
    if (!tableExists || !hasExpectedColumns) {
      // Use the direct-sql endpoint to create the profiles table and policies
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can read their own profile" 
          ON public.profiles 
          FOR SELECT 
          USING (auth.uid() = id);
          
        CREATE POLICY "Users can update their own profile" 
          ON public.profiles 
          FOR UPDATE 
          USING (auth.uid() = id);
          
        CREATE POLICY "Admin users can read all profiles" 
          ON public.profiles 
          FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND is_admin = true
            )
          );
          
        CREATE POLICY "Admin users can update all profiles" 
          ON public.profiles 
          FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND is_admin = true
            )
          );
      `;
      
      // Call the direct-sql endpoint to create the table
      try {
        // First try using the direct-sql API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/direct-sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            query: createTableSql,
            secretKey: adminSecretKey 
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating profiles table via API:", errorData.error);
          throw new Error("Failed to create profiles table via API");
        }
      } catch (err) {
        console.error("Error calling direct-sql endpoint or processing response:", err);
        
        // Fallback: Try to execute SQL directly with the Supabase client
        try {
          // @ts-ignore - Using private API as a fallback
          await supabaseAdmin.rest.query(createTableSql);
          console.log("Created profiles table using direct SQL fallback");
        } catch (sqlErr) {
          console.error("Error in direct SQL fallback:", sqlErr);
          // Continue anyway - the table might already exist partially
        }
      }
    }

    // Create or update profile with admin privileges using direct SQL
    const updateProfileSql = `
      INSERT INTO profiles (id, is_admin)
      VALUES ('${user.id}', true)
      ON CONFLICT (id) 
      DO UPDATE SET is_admin = true, updated_at = NOW();
    `;
    
    // Call the direct-sql endpoint to update the profile
    try {
      // First try using the direct-sql API endpoint
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/direct-sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: updateProfileSql,
          secretKey: adminSecretKey // Fix: Use adminSecretKey instead of process.env.MIGRATION_SECRET_KEY
        }),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Error updating profile via API: ${errorData.error}`);
      }
    } catch (err: any) {
      console.error("Error calling direct-sql endpoint for profile update:", err);
      
      // Fallback: Try to execute SQL directly with the Supabase client
      try {
        // @ts-ignore - Using private API as a fallback
        await supabaseAdmin.rest.query(updateProfileSql);
        console.log("Updated profile using direct SQL fallback");
      } catch (sqlErr: any) {
        console.error("Error in direct SQL fallback for profile update:", sqlErr);
        throw new Error(`Error updating profile: ${sqlErr.message || 'Unknown error'}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} has been granted admin privileges`,
      userId: user.id
    })
  } catch (error: any) {
    console.error("Unexpected error in bootstrap-admin:", error)
    return NextResponse.json({ 
      error: `Unexpected error: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
