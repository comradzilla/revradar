/**
 * Admin Users Management Page
 * 
 * This page allows administrators to manage user roles and permissions.
 * Features include:
 * - Viewing all users in the system
 * - Toggling admin status for users
 * - Assigning and removing roles from users
 */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { getRoles, assignRoleToUser, removeRoleFromUser } from "@/lib/services/database-service"
import { ChevronLeft } from "lucide-react"
import type { Role } from "@/lib/supabase/database.types"

interface UserWithRoles {
  id: string
  email: string
  is_admin: boolean
  roles: Role[]
}

export default function AdminUsersPage() {
  const { isAdmin, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all data needed for the page
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch roles
      const rolesData = await getRoles()
      setRoles(rolesData)

      // Fetch users with profiles
      const { data: usersData, error: usersError } = await supabase.from("profiles").select("*")

      if (usersError) {
        throw new Error(`Error fetching users: ${usersError.message}`)
      }

      // Fetch user emails
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        throw new Error(`Error fetching auth users: ${authError.message}`)
      }

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase.from("user_roles").select("user_id, roles(*)")

      if (rolesError) {
        throw new Error(`Error fetching user roles: ${rolesError.message}`)
      }

      // Combine data
      const combinedUsers = usersData.map((profile) => {
        const authUser = authUsers?.users.find((u) => u.id === profile.id)
        const userRolesList = userRoles
          ?.filter((ur) => ur.user_id === profile.id)
          .map((ur) => ur.roles)
          .flat() as Role[]

        return {
          id: profile.id,
          email: authUser?.email || "Unknown",
          is_admin: profile.is_admin || false,
          roles: userRolesList || [],
        }
      })

      setUsers(combinedUsers)
    } catch (error) {
      console.error("Error in fetchData:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user data",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }

    fetchData()
  }, [isAdmin, router, fetchData])

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    // Don't allow users to remove their own admin status
    if (userId === user?.id && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Security Restriction",
        description: "You cannot remove your own admin status",
      })
      return
    }

    try {
      const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)

      if (error) {
        throw new Error(`Error updating admin status: ${error.message}`)
      }

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_admin: isAdmin } : u)))

      toast({
        title: "Success",
        description: `Admin status ${isAdmin ? "granted" : "revoked"}`,
      })
    } catch (error) {
      console.error("Error in toggleAdmin:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update admin status",
      })
    }
  }

  const handleRoleChange = async (userId: string, roleId: number, hasRole: boolean) => {
    try {
      let success: boolean;
      
      if (hasRole) {
        // Remove role
        success = await removeRoleFromUser(userId, roleId)
        if (!success) {
          throw new Error("Failed to remove role")
        }

        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === userId) {
              return {
                ...u,
                roles: u.roles.filter((r) => r.id !== roleId),
              }
            }
            return u
          }),
        )
      } else {
        // Add role
        success = await assignRoleToUser(userId, roleId)
        if (!success) {
          throw new Error("Failed to assign role")
        }

        const role = roles.find((r) => r.id === roleId)
        if (role) {
          setUsers((prev) =>
            prev.map((u) => {
              if (u.id === userId) {
                return {
                  ...u,
                  roles: [...u.roles, role],
                }
              }
              return u
            }),
          )
        }
      }

      toast({
        title: "Success",
        description: `Role ${hasRole ? "removed" : "assigned"} successfully`,
      })
    } catch (error) {
      console.error("Error in handleRoleChange:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
      })
    }
  }

  // Early return if not admin
  if (!isAdmin) {
    return null
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/admin")} 
            className="mr-2"
            aria-label="Back to admin dashboard"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2E2E2E]">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3A9D42]" aria-label="Loading"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.is_admin} 
                        onCheckedChange={(checked) => toggleAdmin(user.id, checked)}
                        aria-label={`Toggle admin status for ${user.email}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {roles.map((role) => {
                          const hasRole = user.roles.some((r) => r.id === role.id)
                          return (
                            <div key={role.id} className="flex items-center gap-2">
                              <Switch
                                checked={hasRole}
                                onCheckedChange={() => handleRoleChange(user.id, role.id, hasRole)}
                                aria-label={`Toggle ${role.name} role for ${user.email}`}
                              />
                              <span className="text-sm">{role.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
