"use client"

import { Header } from "@/components/header"
import { SeedDatabase } from "@/lib/seed-database"
import { ManualSeedInstructions } from "@/components/manual-seed-instructions"
import { DatabaseTroubleshooter } from "@/components/database-troubleshooter"

export default function SetupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      <Header />
      <main className="flex-1 container max-w-3xl py-12">
        <h1 className="text-2xl font-bold mb-8">Setup Your GTM Prompt Library</h1>

        <div className="space-y-8">
          <div className="p-6 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Welcome to the Setup Page</h2>
            <p className="mb-4 text-gray-400">
              This page helps you initialize your GTM Prompt Library with sample data. Follow the steps below to get
              started.
            </p>
          </div>

          <SeedDatabase />

          <div className="p-6 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg">
            <ManualSeedInstructions />
          </div>

          <div className="p-6 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg">
            <DatabaseTroubleshooter />
          </div>
        </div>
      </main>
    </div>
  )
}
