import { Suspense } from "react"
import { Header } from "@/components/header"
import PromptLibraryWrapper from "@/components/prompt-library-wrapper"

export default function PromptLibraryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-8 text-center">Loading prompt library...</div>}>
          <PromptLibraryWrapper />
        </Suspense>
      </main>

      <footer className="px-8 md:px-12 py-8 border-t border-[#2E2E2E]">
        <p className="font-mono text-xs text-[#666666]">© {new Date().getFullYear()} revradar.io</p>
        <div className="mt-4 flex space-x-6">
          <a
            href="mailto:ashkan@revradar.io"
            className="font-mono text-xs text-[#666666] hover:text-[#3A9D42] transition-colors"
          >
            contact
          </a>
          <a
            href="https://www.linkedin.com/in/ashkan-naderi/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[#666666] hover:text-[#3A9D42] transition-colors"
          >
            linkedin
          </a>
        </div>
      </footer>
    </div>
  )
}
