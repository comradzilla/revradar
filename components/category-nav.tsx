"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Category {
  id: string
  name: string
  subcategories?: { id: string; name: string }[]
}

interface CategoryNavProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (categoryId: string) => void
}

export function CategoryNav({ categories, selectedCategory, onSelectCategory }: CategoryNavProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const navRef = useRef<HTMLElement>(null)

  // Auto-expand categories when a subcategory is selected
  useEffect(() => {
    if (selectedCategory) {
      // Find if the selected category is a subcategory
      for (const category of categories) {
        const isSubcategory = category.subcategories?.some((sub) => sub.id === selectedCategory)
        if (isSubcategory && !expandedCategories.includes(category.id)) {
          setExpandedCategories((prev) => [...prev, category.id])
          break
        }
      }
    }
  }, [selectedCategory, categories, expandedCategories])

  const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent the category from being selected when clicking the accordion trigger
    e.stopPropagation()
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Handle category selection with guaranteed state update
  const handleCategoryClick = (categoryId: string) => {
    // Always call onSelectCategory, even if it's the same category
    // This ensures the store logic runs even when clicking the same category
    onSelectCategory(categoryId)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if nav is focused or one of its children
      if (!navRef.current?.contains(document.activeElement)) return

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()

        // Get all interactive elements in the nav
        const interactiveElements = Array.from(navRef.current.querySelectorAll('button, [role="button"]')).filter(
          (el) => {
            // Filter out hidden elements (like those in collapsed accordions)
            const style = window.getComputedStyle(el)
            return style.display !== "none" && style.visibility !== "hidden"
          },
        )

        const currentIndex = interactiveElements.findIndex((el) => el === document.activeElement)

        if (currentIndex !== -1) {
          const nextIndex =
            e.key === "ArrowDown"
              ? (currentIndex + 1) % interactiveElements.length
              : (currentIndex - 1 + interactiveElements.length) % interactiveElements.length
          ;(interactiveElements[nextIndex] as HTMLElement).focus()
        } else if (interactiveElements.length > 0) {
          // Focus first element if none is focused
          ;(interactiveElements[0] as HTMLElement).focus()
        }
      }

      // Handle left/right arrow keys for category navigation
      if (e.key === "ArrowRight" && selectedCategory) {
        // Find the category that contains this subcategory
        const parentCategory = categories.find((cat) => cat.subcategories?.some((sub) => sub.id === selectedCategory))

        if (parentCategory && !expandedCategories.includes(parentCategory.id)) {
          setExpandedCategories((prev) => [...prev, parentCategory.id])
        }
      }

      if (e.key === "ArrowLeft" && selectedCategory) {
        // If in a subcategory, go to parent category
        const parentCategory = categories.find((cat) => cat.subcategories?.some((sub) => sub.id === selectedCategory))

        if (parentCategory) {
          handleCategoryClick(parentCategory.id)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [categories, expandedCategories, selectedCategory, onSelectCategory])

  return (
    <nav ref={navRef} className="w-[180px] flex-shrink-0 border-r border-[#2E2E2E] overflow-y-auto p-2">
      <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3 py-2">Categories</h2>

      <Accordion type="multiple" value={expandedCategories} className="space-y-1">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-0">
            <div className="flex items-center">
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  flex-1 px-3 py-1.5 text-sm rounded-md hover:bg-[#1A1A1A] text-left
                  ${selectedCategory === category.id ? "bg-[#1A1A1A] text-[#3A9D42]" : ""}
                `}
              >
                {category.name}
              </button>
              {category.subcategories && category.subcategories.length > 0 && (
                <AccordionTrigger onClick={(e) => toggleCategory(category.id, e)} className="px-2 py-1.5" />
              )}
            </div>

            {category.subcategories && (
              <AccordionContent className="pt-1 pb-0 pl-4">
                <ul className="space-y-1">
                  {category.subcategories.map((subcat) => (
                    <li key={subcat.id}>
                      <button
                        onClick={() => handleCategoryClick(subcat.id)}
                        className={`
                          w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-[#1A1A1A]
                          ${selectedCategory === subcat.id ? "bg-[#1A1A1A] text-[#3A9D42]" : ""}
                        `}
                      >
                        {subcat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </nav>
  )
}
