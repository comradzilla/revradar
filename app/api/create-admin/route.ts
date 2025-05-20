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
    const { userId, email, secretKey } = await request.json()

    // Verify secret key for security
    if (!secretKey || secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!userId && !email) {
      return NextResponse.json({ error: "User ID or email is required" }, { status: 400 })
    }

    let targetUserId = userId

    // If email is provided but not userId, look up the user
    if (!targetUserId && email) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()

      if (userError) {
        return NextResponse.json({ error: `Error finding user: ${userError.message}` }, { status: 500 })
      }

      const user = userData.users.find((u) => u.email === email)

      if (!user) {
        return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 })
      }

      targetUserId = user.id
    }

    // Check if profiles table exists, create it if not
    const { data: tableExists, error: tableError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "profiles")
      .single()

    if (tableError && !tableExists) {
      // Create profiles table
      const { error: createTableError } = await supabaseAdmin
        .from("profiles")
        .insert([{ id: targetUserId, is_admin: true }])
        .select()

      if (createTableError && createTableError.message.includes("does not exist")) {
        // Table doesn't exist, create it
        const createTableResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            query: `
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
            `,
          }),
        })

        if (!createTableResponse.ok) {
          const errorText = await createTableResponse.text()
          return NextResponse.json({ error: `Error creating profiles table: ${errorText}` }, { status: 500 })
        }
      }
    }

    // Insert or update the profile to make the user an admin
    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: targetUserId, is_admin: true })
      .select()

    if (upsertError) {
      return NextResponse.json({ error: `Error making user admin: ${upsertError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: targetUserId })
  } catch (error: any) {
    return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 })
  }
}
