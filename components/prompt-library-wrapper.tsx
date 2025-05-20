"use client"

import { Suspense } from "react"
import { PromptLibrary } from "@/components/prompt-library"

export default function PromptLibraryWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading prompt library...</div>}>
      <PromptLibrary />
    </Suspense>
  )
}
