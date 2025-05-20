"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft } from "lucide-react"
import type { AuditLog } from "@/lib/supabase/database.types"

export default function AuditLogsPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    table: "",
    record: "",
    user: "",
    limit: "100",
  })

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }

    fetchAuditLogs()
  }, [isAdmin, router, filter])

  const fetchAuditLogs = async () => {
    setIsLoading(true)

    try {
      // Build query string
      const params = new URLSearchParams()
      if (filter.table) params.append("table", filter.table)
      if (filter.record) params.append("record", filter.record)
      if (filter.user) params.append("user", filter.user)
      params.append("limit", filter.limit)

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const { data, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      setAuditLogs(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch audit logs",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatAction = (action: string) => {
    switch (action) {
      case "INSERT":
        return <span className="text-green-500">Created</span>
      case "UPDATE":
        return <span className="text-blue-500">Updated</span>
      case "DELETE":
        return <span className="text-red-500">Deleted</span>
      default:
        return action
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin")} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
        </div>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2E2E2E] mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by table, record, or user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Table</label>
              <Select value={filter.table} onValueChange={(value) => setFilter((prev) => ({ ...prev, table: value }))}>
                <SelectTrigger className="bg-[#0D0D0D] border-[#2E2E2E]">
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2E2E2E]">
                  <SelectItem value="all">All tables</SelectItem>
                  <SelectItem value="prompts">Prompts</SelectItem>
                  <SelectItem value="categories">Categories</SelectItem>
                  <SelectItem value="subcategories">Subcategories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Record ID</label>
              <Input
                value={filter.record}
                onChange={(e) => setFilter((prev) => ({ ...prev, record: e.target.value }))}
                placeholder="Record ID"
                className="bg-[#0D0D0D] border-[#2E2E2E]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">User ID</label>
              <Input
                value={filter.user}
                onChange={(e) => setFilter((prev) => ({ ...prev, user: e.target.value }))}
                placeholder="User ID"
                className="bg-[#0D0D0D] border-[#2E2E2E]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Limit</label>
              <Select value={filter.limit} onValueChange={(value) => setFilter((prev) => ({ ...prev, limit: value }))}>
                <SelectTrigger className="bg-[#0D0D0D] border-[#2E2E2E]">
                  <SelectValue placeholder="100" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2E2E2E]">
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#2E2E2E]">
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>View system activity and changes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3A9D42]"></div>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>User ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell>{formatAction(log.action)}</TableCell>
                      <TableCell>{log.table_name}</TableCell>
                      <TableCell className="font-mono text-xs">{log.record_id}</TableCell>
                      <TableCell className="font-mono text-xs">{log.user_id || "Anonymous"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
