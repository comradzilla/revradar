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
    const { email, secretKey } = await request.json()

    // Verify secret key for security
    if (!secretKey || secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json({ error: `Error listing users: ${listError.message}` }, { status: 500 })
    }
    
    // Find the user with the matching email
    const user = users?.users.find((u) => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: "User not found with the provided email" }, { status: 404 })
    }

    // Check if profiles table exists
    const { error: tableCheckError } = await supabaseAdmin.from("profiles").select("id").limit(1)

    // Create profiles table if it doesn't exist
    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      await supabaseAdmin.sql(`
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
      `)
    }

    // Create or update profile with admin privileges using SQL
    // This bypasses RLS policies
    const { error: updateError } = await supabaseAdmin.sql(`
      INSERT INTO profiles (id, is_admin)
      VALUES ('${user.id}', true)
      ON CONFLICT (id) 
      DO UPDATE SET is_admin = true, updated_at = NOW();
    `)

    if (updateError) {
      return NextResponse.json({ error: `Error updating profile: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `User ${email} is now an admin` })
  } catch (error: any) {
    return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 })
  }
}
