"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { getUserRoles } from "@/lib/services/database-service"

export function usePermission(permission: string) {
  const { user, isAdmin } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true)

      // Admins have all permissions
      if (isAdmin) {
        setHasPermission(true)
        setIsLoading(false)
        return
      }

      // No user means no permissions
      if (!user) {
        setHasPermission(false)
        setIsLoading(false)
        return
      }

      // Check user roles and permissions
      const roles = await getUserRoles(user.id)
      const permitted = roles.some((role) => {
        const permissions = role.permissions as Record<string, boolean>
        return permissions[permission] === true
      })

      setHasPermission(permitted)
      setIsLoading(false)
    }

    checkPermission()
  }, [user, isAdmin, permission])

  return { hasPermission, isLoading }
}
