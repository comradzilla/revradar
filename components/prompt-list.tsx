"use client"

import { useEffect, useRef } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Plus, FolderPlus } from "lucide-react"
import { useStore } from "@/lib/store"

interface Prompt {
  id: string
  title: string
  description: string
  whenToUse: string
  content: string
  categoryId: string
  searchScore?: number
}

interface PromptListProps {
  prompts: Prompt[]
  selectedPromptId: string | undefined
  onSelectPrompt: (prompt: Prompt) => void
  isAdminMode?: boolean
  selectedCategory: string | null
}

export function PromptList({
  prompts,
  selectedPromptId,
  onSelectPrompt,
  isAdminMode = false,
  selectedCategory,
}: PromptListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const { addPrompt, categories } = useStore()

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if list is focused or one of its children
      if (!listRef.current?.contains(document.activeElement)) return

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()

        // Get all buttons in the list
        const buttons = Array.from(listRef.current.querySelectorAll("button"))
        const currentIndex = buttons.findIndex((button) => button === document.activeElement)

        if (currentIndex !== -1) {
          const nextIndex =
            e.key === "ArrowDown"
              ? (currentIndex + 1) % buttons.length
              : (currentIndex - 1 + buttons.length) % buttons.length

          buttons[nextIndex].focus()
        } else if (buttons.length > 0) {
          // Focus first button if none is focused
          buttons[0].focus()
        }
      }

      // Select prompt with Enter
      if (e.key === "Enter" && document.activeElement instanceof HTMLButtonElement) {
        const promptId = document.activeElement.dataset.promptId
        const prompt = prompts.find((p) => p.id === promptId)
        if (prompt) {
          onSelectPrompt(prompt)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [prompts, onSelectPrompt])

  const handleAddNewPrompt = () => {
    // Use the selected category if available, otherwise use the first category
    const defaultCategoryId =
      selectedCategory ||
      categories[0]?.id ||
      (categories[0]?.subcategories && categories[0].subcategories[0]?.id) ||
      ""

    const newPrompt = {
      id: `new-prompt-${Date.now()}`,
      title: "New Prompt",
      description: "Description of the new prompt",
      whenToUse: "When to use this prompt",
      content: "Enter your prompt content here...",
      categoryId: defaultCategoryId,
      variables: {},
    }

    addPrompt(newPrompt)
    onSelectPrompt(newPrompt)
  }

  // Find the category name for the empty state message
  const getCategoryName = () => {
    if (!selectedCategory) return "this category"

    // Check main categories
    const mainCategory = categories.find((cat) => cat.id === selectedCategory)
    if (mainCategory) return mainCategory.name

    // Check subcategories
    for (const category of categories) {
      const subcat = category.subcategories?.find((sub) => sub.id === selectedCategory)
      if (subcat) return subcat.name
    }

    return "this category"
  }

  // Find the parent category for a subcategory
  const getParentCategory = (subcategoryId: string) => {
    for (const category of categories) {
      if (category.subcategories?.some((sub) => sub.id === subcategoryId)) {
        return category
      }
    }
    return null
  }

  // Check if the selected category is a main category with no subcategories
  const isEmptyMainCategory = () => {
    if (!selectedCategory) return false

    const category = categories.find((c) => c.id === selectedCategory)
    return category && (!category.subcategories || category.subcategories.length === 0)
  }

  // Check if the selected category is a subcategory
  const isSubcategory = () => {
    if (!selectedCategory) return false

    return categories.some((c) => c.subcategories?.some((sub) => sub.id === selectedCategory))
  }

  return (
    <div ref={listRef} className="w-[260px] flex-shrink-0 border-r border-[#2E2E2E] overflow-y-auto">
      <div className="p-2">
        <div className="flex items-center justify-between px-3 py-2">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Prompts {prompts.length > 0 && `(${prompts.length})`}
          </h2>

          {isAdminMode && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#3A9D42]" onClick={handleAddNewPrompt}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add new prompt</span>
            </Button>
          )}
        </div>

        {prompts.length > 0 ? (
          <ul className="space-y-1">
            {prompts.map((prompt) => (
              <li key={prompt.id}>
                <HoverCard openDelay={250}>
                  <HoverCardTrigger asChild>
                    <button
                      data-prompt-id={prompt.id}
                      onClick={() => onSelectPrompt(prompt)}
                      className={`
                        w-full text-left px-3 py-2 text-sm rounded-md hover:bg-[#1A1A1A]
                        ${selectedPromptId === prompt.id ? "bg-[#1A1A1A] text-[#3A9D42]" : ""}
                      `}
                    >
                      {prompt.title}
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" className="w-[240px] bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                    <div className="space-y-2">
                      <p className="text-xs">{prompt.description}</p>
                      {prompt.whenToUse && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#3A9D42]">When to use:</h4>
                          <p className="text-xs">{prompt.whenToUse}</p>
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-3 py-6 text-center">
            {selectedCategory ? (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <FolderPlus className="h-10 w-10 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">No prompts found in {getCategoryName()}</p>
                {isAdminMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewPrompt}
                    className="mt-2 text-[#3A9D42] border-[#3A9D42]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Prompt
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No prompts found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
