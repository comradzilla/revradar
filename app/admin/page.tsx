"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth/auth-context"
import Link from "next/link"

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")

  if (!isAdmin) {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>You need admin privileges to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/")} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/setup-init">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-[#0D0D0D]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Manage your GTM Prompt Library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Manage categories and prompts</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setActiveTab("content")} className="w-full">
                      Manage Content
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Manage users and permissions</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setActiveTab("users")} className="w-full">
                      Manage Users
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Setup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Configure system settings</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => router.push("/admin/setup-init")} className="w-full">
                      Setup
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage categories and prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content management features will be implemented here.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/admin/content")} className="w-full">
                Go to Content Manager
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management features will be implemented here.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/admin/users")} className="w-full">
                Go to User Manager
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
