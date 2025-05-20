import type React from "react"
export default function BootstrapAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Setup</h1>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
