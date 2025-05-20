import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Create admin client to access auth admin APIs
  const supabaseAdmin = createRouteHandlerClient({ cookies })

  // Fetch users with admin status
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, is_admin")

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  // Fetch user emails from auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Combine data
  const users = profiles.map((profile) => {
    const authUser = authData?.users.find((u) => u.id === profile.id)
    return {
      id: profile.id,
      email: authUser?.email || "Unknown",
      is_admin: profile.is_admin,
    }
  })

  return NextResponse.json({ data: users })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get request body
  const { userId, isAdmin } = await request.json()

  // Update user admin status
  const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
