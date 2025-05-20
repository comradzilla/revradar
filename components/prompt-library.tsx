"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { CategoryNav } from "@/components/category-nav"
import { PromptList } from "@/components/prompt-list"
import { PromptDetail } from "@/components/prompt-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function PromptLibrary() {
  const {
    categories,
    prompts,
    selectedCategory,
    selectedPrompt,
    setSelectedCategory,
    setSelectedPrompt,
    fetchData,
    searchPrompts,
    isLoading,
    error,
    isSeeded,
    checkIfSeeded,
  } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [copied, setCopied] = useState(false)
  const [exported, setExported] = useState(false)
  const { toast } = useToast()

  // Check if database is seeded on mount
  useEffect(() => {
    checkIfSeeded()
  }, [checkIfSeeded])

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle search
  useEffect(() => {
    searchPrompts(searchQuery)
  }, [searchQuery, searchPrompts])

  // Filter prompts based on selected category and search query
  const filteredPrompts = prompts
    .filter((prompt) => {
      if (!selectedCategory) return true
      return prompt.category_id === selectedCategory
    })
    .filter((prompt) => {
      if (!searchQuery) return true
      return prompt.searchScore !== undefined && prompt.searchScore > 0
    })
    .sort((a, b) => {
      if (searchQuery) {
        // If searching, sort by search score
        const scoreA = a.searchScore || 0
        const scoreB = b.searchScore || 0
        return scoreB - scoreA
      }
      // Otherwise sort alphabetically
      return a.title.localeCompare(b.title)
    })

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  if (!isSeeded) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-8">
        <h2 className="text-2xl font-bold mb-4">Database Not Seeded</h2>
        <p className="text-center mb-6">
          The database has not been seeded with initial data. Please visit the setup page to seed the database.
        </p>
        <Link href="/setup">
          <Button>Go to Setup Page</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A9D42]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-8">
        <h2 className="text-2xl font-bold mb-4">Error Loading Prompt Library</h2>
        <p className="text-center mb-6">{error}</p>
        <Button onClick={() => fetchData()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center p-4 border-b border-[#2E2E2E]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1A1A1A] border-[#2E2E2E] focus:border-[#3A9D42] focus:ring-[#3A9D42]"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="flex flex-1 overflow-hidden border-l border-[#2E2E2E]">
          <PromptList
            prompts={filteredPrompts}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={setSelectedPrompt}
            searchQuery={searchQuery}
          />

          {selectedPrompt ? (
            <PromptDetail
              prompt={selectedPrompt}
              onCopy={handleCopy}
              onExport={handleExport}
              onShare={() => {
                toast({
                  description: "Link copied to clipboard",
                  duration: 2000,
                })
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400">
              {filteredPrompts.length > 0 ? (
                <p>Select a prompt to view details</p>
              ) : searchQuery ? (
                <p>No prompts found matching your search</p>
              ) : (
                <p>No prompts found in this category</p>
              )}
            </div>
          )}
        </div>
      </div>

      {copied && (
        <div className="fixed bottom-4 right-4 bg-[#3A9D42] text-white px-4 py-2 rounded-md shadow-lg">
          Prompt copied to clipboard
        </div>
      )}

      {exported && (
        <div className="fixed bottom-4 right-4 bg-[#3A9D42] text-white px-4 py-2 rounded-md shadow-lg">
          Prompt exported as Markdown
        </div>
      )}
    </div>
  )
}
