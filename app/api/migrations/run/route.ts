import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Verify the request is from an admin
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

    // Run migrations
    const migrations = [
      // Create roles table if it doesn't exist
      `CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        permissions JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Create user_roles table if it doesn't exist
      `CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, role_id)
      );`,

      // Create audit_logs table if it doesn't exist
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT,
        old_data JSONB,
        new_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Add owner_id to categories if it doesn't exist
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'owner_id'
        ) THEN
          ALTER TABLE categories ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
      END $$;`,

      // Add owner_id to prompts if it doesn't exist
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'prompts' AND column_name = 'owner_id'
        ) THEN
          ALTER TABLE prompts ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
      END $$;`,

      // Add status to prompts if it doesn't exist
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'prompts' AND column_name = 'status'
        ) THEN
          ALTER TABLE prompts ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
        END IF;
      END $$;`,

      // Insert default roles if they don't exist
      `INSERT INTO roles (name, description, permissions)
      VALUES 
        ('admin', 'Full access to all resources', '{"create:any": true, "read:any": true, "update:any": true, "delete:any": true, "approve:any": true}'),
        ('manager', 'Can manage content but not users', '{"create:any": true, "read:any": true, "update:any": true, "delete:any": true, "approve:own": true}'),
        ('editor', 'Can create and edit content', '{"create:own": true, "read:any": true, "update:own": true, "delete:own": true}'),
        ('viewer', 'Can only view content', '{"read:any": true}')
      ON CONFLICT (name) DO NOTHING;`,
    ]

    // Execute each migration
    for (const migration of migrations) {
      const { error } = await supabase.rpc("execute_sql", { sql_query: migration })
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
