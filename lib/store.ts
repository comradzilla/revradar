"use client"

import { create } from "zustand"
import lunr from "lunr"
import { persist } from "zustand/middleware"
import {
  getCategories,
  getPrompts,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  createPrompt,
  updatePrompt as updatePromptInDb,
  deletePrompt as deletePromptInDb,
  trackPromptAction,
  isDatabaseSeeded,
} from "@/lib/services/database-service"
import type { CategoryWithSubcategories, PromptWithVariables } from "@/lib/supabase/database.types"

interface StoreState {
  categories: CategoryWithSubcategories[]
  prompts: PromptWithVariables[]
  selectedCategory: string | null
  selectedPrompt: PromptWithVariables | null
  searchIndex: lunr.Index | null
  isLoading: boolean
  error: string | null
  isSeeded: boolean

  // Data fetching
  fetchData: () => Promise<void>
  checkIfSeeded: () => Promise<boolean>

  // Selection
  setSelectedCategory: (categoryId: string) => void
  setSelectedPrompt: (prompt: PromptWithVariables | null) => void

  // Search
  searchPrompts: (query: string) => void

  // Prompt CRUD
  addPrompt: (prompt: PromptWithVariables) => Promise<boolean>
  updatePrompt: (prompt: PromptWithVariables) => Promise<boolean>
  deletePrompt: (promptId: string) => Promise<boolean>

  // Category CRUD
  addCategory: (category: Omit<CategoryWithSubcategories, "subcategories">) => Promise<boolean>
  updateCategory: (category: Omit<CategoryWithSubcategories, "subcategories">) => Promise<boolean>
  deleteCategory: (categoryId: string) => Promise<boolean>

  // Subcategory CRUD
  addSubcategory: (parentId: string, subcategory: { id: string; name: string }) => Promise<boolean>
  updateSubcategory: (parentId: string, subcategory: { id: string; name: string }) => Promise<boolean>
  deleteSubcategory: (parentId: string, subcategoryId: string) => Promise<boolean>

  // Analytics
  trackAction: (promptId: string, action: string, userId?: string) => Promise<void>
}

// Initialize search index
const createSearchIndex = (prompts: PromptWithVariables[]) => {
  if (typeof window === "undefined") return null

  return lunr(function () {
    this.field("title", { boost: 10 })
    this.field("description", { boost: 5 })
    this.field("content")
    this.field("when_to_use")

    this.ref("id")

    prompts.forEach((prompt) => {
      this.add({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        when_to_use: prompt.when_to_use,
      })
    })
  })
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: [],
      prompts: [],
      selectedCategory: null,
      selectedPrompt: null,
      searchIndex: null,
      isLoading: false,
      error: null,
      isSeeded: false,

      checkIfSeeded: async () => {
        const seeded = await isDatabaseSeeded()
        set({ isSeeded: seeded })
        return seeded
      },

      fetchData: async () => {
        set({ isLoading: true, error: null })

        try {
          // Check if database is seeded
          const isSeeded = await isDatabaseSeeded()
          set({ isSeeded })

          if (!isSeeded) {
            set({
              isLoading: false,
              error: "Database not seeded. Please visit the setup page to seed the database.",
            })
            return
          }

          // Fetch categories and prompts in parallel
          const [categoriesData, promptsData] = await Promise.all([getCategories(), getPrompts()])

          set({
            categories: categoriesData,
            prompts: promptsData,
            searchIndex: createSearchIndex(promptsData),
            isLoading: false,
          })
        } catch (error) {
          console.error("Error fetching data:", error)
          set({
            error: "Failed to fetch data. Please try again later.",
            isLoading: false,
          })
        }
      },

      setSelectedCategory: (categoryId) => {
        const { categories, prompts } = get()

        // Find the category
        const category = categories.find((c) => c.id === categoryId)

        // If this is a main category with subcategories
        if (category && category.subcategories && category.subcategories.length > 0) {
          // Find the first subcategory that has prompts
          const subcategoryWithPrompts = category.subcategories.find((sub) =>
            prompts.some((p) => p.category_id === sub.id),
          )

          // If found a subcategory with prompts, select it
          if (subcategoryWithPrompts) {
            set({ selectedCategory: subcategoryWithPrompts.id })

            // Find prompts for this subcategory
            const subcategoryPrompts = prompts.filter((p) => p.category_id === subcategoryWithPrompts.id)
            if (subcategoryPrompts.length > 0) {
              set({ selectedPrompt: subcategoryPrompts[0] })
            } else {
              set({ selectedPrompt: null })
            }

            return
          }

          // If no subcategory has prompts, just select the first subcategory
          set({ selectedCategory: category.subcategories[0].id, selectedPrompt: null })
          return
        }

        // Otherwise, just select the category as before
        set({ selectedCategory: categoryId })

        // Find prompts for this category
        const categoryPrompts = prompts.filter((p) => p.category_id === categoryId)

        // If there are prompts in this category
        if (categoryPrompts.length > 0) {
          // If the current selected prompt is not in this category, select the first prompt
          const { selectedPrompt } = get()
          if (!selectedPrompt || selectedPrompt.category_id !== categoryId) {
            set({ selectedPrompt: categoryPrompts[0] })
          }
        } else {
          // If there are no prompts in this category, clear the selected prompt
          set({ selectedPrompt: null })
        }
      },

      setSelectedPrompt: (prompt) => {
        set({ selectedPrompt: prompt })
      },

      searchPrompts: (query) => {
        if (!query.trim()) {
          set((state) => ({
            prompts: state.prompts.map((p) => ({ ...p, searchScore: undefined })),
          }))
          return
        }

        const { searchIndex, prompts } = get()
        let index = searchIndex

        if (!index) {
          index = createSearchIndex(prompts)
          set({ searchIndex: index })
        }

        if (!index) {
          // Fallback to simple search if index creation failed
          const lowerQuery = query.toLowerCase()
          const updatedPrompts = prompts.map((prompt) => {
            const titleMatch = prompt.title.toLowerCase().includes(lowerQuery)
            const descMatch = prompt.description.toLowerCase().includes(lowerQuery)
            const contentMatch = prompt.content.toLowerCase().includes(lowerQuery)

            return {
              ...prompt,
              searchScore: titleMatch ? 2 : descMatch || contentMatch ? 1 : 0,
            }
          })

          set({ prompts: updatedPrompts })
          return
        }

        try {
          const results = index.search(query)

          const updatedPrompts = prompts.map((prompt) => {
            const result = results.find((r) => r.ref === prompt.id)
            return {
              ...prompt,
              searchScore: result ? result.score : 0,
            }
          })

          set({ prompts: updatedPrompts })
        } catch (error) {
          // Fallback to simple search on lunr syntax error
          const lowerQuery = query.toLowerCase()
          const updatedPrompts = prompts.map((prompt) => {
            const titleMatch = prompt.title.toLowerCase().includes(lowerQuery)
            const descMatch = prompt.description.toLowerCase().includes(lowerQuery)
            const contentMatch = prompt.content.toLowerCase().includes(lowerQuery)

            return {
              ...prompt,
              searchScore: titleMatch ? 2 : descMatch || contentMatch ? 1 : 0,
            }
          })

          set({ prompts: updatedPrompts })
        }
      },

      // Prompt CRUD
      addPrompt: async (prompt) => {
        try {
          const newPrompt = await createPrompt({
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            when_to_use: prompt.when_to_use,
            content: prompt.content,
            category_id: prompt.category_id,
            variables: prompt.variables || {},
          })

          if (!newPrompt) return false

          set((state) => {
            const newPrompts = [...state.prompts, prompt]
            return {
              prompts: newPrompts,
              searchIndex: createSearchIndex(newPrompts),
              selectedPrompt: prompt,
            }
          })

          return true
        } catch (error) {
          console.error("Error adding prompt:", error)
          return false
        }
      },

      updatePrompt: async (updatedPrompt) => {
        try {
          const result = await updatePromptInDb({
            id: updatedPrompt.id,
            title: updatedPrompt.title,
            description: updatedPrompt.description,
            when_to_use: updatedPrompt.when_to_use,
            content: updatedPrompt.content,
            category_id: updatedPrompt.category_id,
            variables: updatedPrompt.variables || {},
          })

          if (!result) return false

          set((state) => {
            const newPrompts = state.prompts.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p))
            return {
              prompts: newPrompts,
              searchIndex: createSearchIndex(newPrompts),
              // Update selected prompt if it's the one being edited
              selectedPrompt: state.selectedPrompt?.id === updatedPrompt.id ? updatedPrompt : state.selectedPrompt,
            }
          })

          return true
        } catch (error) {
          console.error("Error updating prompt:", error)
          return false
        }
      },

      deletePrompt: async (promptId) => {
        try {
          const success = await deletePromptInDb(promptId)

          if (!success) return false

          set((state) => {
            const newPrompts = state.prompts.filter((p) => p.id !== promptId)

            // Find a new prompt to select if the current one is being deleted
            let newSelectedPrompt = state.selectedPrompt
            if (state.selectedPrompt?.id === promptId) {
              const categoryPrompts = newPrompts.filter((p) => p.category_id === state.selectedCategory)
              newSelectedPrompt = categoryPrompts.length > 0 ? categoryPrompts[0] : null
            }

            return {
              prompts: newPrompts,
              searchIndex: createSearchIndex(newPrompts),
              selectedPrompt: newSelectedPrompt,
            }
          })

          return true
        } catch (error) {
          console.error("Error deleting prompt:", error)
          return false
        }
      },

      // Category CRUD
      addCategory: async (category) => {
        try {
          const newCategory = await createCategory({
            id: category.id,
            name: category.name,
          })

          if (!newCategory) return false

          set((state) => ({
            categories: [...state.categories, { ...newCategory, subcategories: [] }],
          }))

          return true
        } catch (error) {
          console.error("Error adding category:", error)
          return false
        }
      },

      updateCategory: async (updatedCategory) => {
        try {
          const result = await updateCategory({
            id: updatedCategory.id,
            name: updatedCategory.name,
          })

          if (!result) return false

          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === updatedCategory.id ? { ...c, name: updatedCategory.name } : c,
            ),
          }))

          return true
        } catch (error) {
          console.error("Error updating category:", error)
          return false
        }
      },

      deleteCategory: async (categoryId) => {
        try {
          const success = await deleteCategory(categoryId)

          if (!success) return false

          set((state) => {
            // Get all subcategory IDs for this category
            const category = state.categories.find((c) => c.id === categoryId)
            const subcategoryIds = category?.subcategories?.map((s) => s.id) || []

            // Filter out prompts that belong to this category or its subcategories
            const newPrompts = state.prompts.filter(
              (p) => p.category_id !== categoryId && !subcategoryIds.includes(p.category_id),
            )

            // Update selected category and prompt if needed
            let newSelectedCategory = state.selectedCategory
            let newSelectedPrompt = state.selectedPrompt

            if (state.selectedCategory === categoryId || subcategoryIds.includes(state.selectedCategory || "")) {
              newSelectedCategory = state.categories[0]?.id || null

              if (newSelectedCategory) {
                const categoryPrompts = newPrompts.filter((p) => p.category_id === newSelectedCategory)
                newSelectedPrompt = categoryPrompts.length > 0 ? categoryPrompts[0] : null
              } else {
                newSelectedPrompt = null
              }
            }

            return {
              categories: state.categories.filter((c) => c.id !== categoryId),
              prompts: newPrompts,
              selectedCategory: newSelectedCategory,
              selectedPrompt: newSelectedPrompt,
              searchIndex: createSearchIndex(newPrompts),
            }
          })

          return true
        } catch (error) {
          console.error("Error deleting category:", error)
          return false
        }
      },

      // Subcategory CRUD
      addSubcategory: async (parentId, subcategory) => {
        try {
          const newSubcategory = await createSubcategory({
            id: subcategory.id,
            name: subcategory.name,
            category_id: parentId,
          })

          if (!newSubcategory) return false

          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    subcategories: [...(c.subcategories || []), { id: subcategory.id, name: subcategory.name }],
                  }
                : c,
            ),
          }))

          return true
        } catch (error) {
          console.error("Error adding subcategory:", error)
          return false
        }
      },

      updateSubcategory: async (parentId, updatedSubcategory) => {
        try {
          const result = await updateSubcategory({
            id: updatedSubcategory.id,
            name: updatedSubcategory.name,
            category_id: parentId,
          })

          if (!result) return false

          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    subcategories: c.subcategories?.map((s) =>
                      s.id === updatedSubcategory.id ? { id: s.id, name: updatedSubcategory.name } : s,
                    ),
                  }
                : c,
            ),
          }))

          return true
        } catch (error) {
          console.error("Error updating subcategory:", error)
          return false
        }
      },

      deleteSubcategory: async (parentId, subcategoryId) => {
        try {
          const success = await deleteSubcategory(subcategoryId)

          if (!success) return false

          set((state) => {
            // Filter out prompts that belong to this subcategory
            const newPrompts = state.prompts.filter((p) => p.category_id !== subcategoryId)

            // Update selected category and prompt if needed
            let newSelectedCategory = state.selectedCategory
            let newSelectedPrompt = state.selectedPrompt

            if (state.selectedCategory === subcategoryId) {
              // Select the parent category or first subcategory
              const parentCategory = state.categories.find((c) => c.id === parentId)
              if (parentCategory && parentCategory.subcategories && parentCategory.subcategories.length > 1) {
                // Find the first subcategory that's not being deleted
                const firstSubcategory = parentCategory.subcategories.find((s) => s.id !== subcategoryId)
                if (firstSubcategory) {
                  newSelectedCategory = firstSubcategory.id
                  const subcategoryPrompts = newPrompts.filter((p) => p.category_id === firstSubcategory.id)
                  newSelectedPrompt = subcategoryPrompts.length > 0 ? subcategoryPrompts[0] : null
                } else {
                  newSelectedCategory = parentId
                  newSelectedPrompt = null
                }
              } else {
                newSelectedCategory = parentId
                newSelectedPrompt = null
              }
            }

            return {
              categories: state.categories.map((c) =>
                c.id === parentId
                  ? {
                      ...c,
                      subcategories: c.subcategories?.filter((s) => s.id !== subcategoryId),
                    }
                  : c,
              ),
              prompts: newPrompts,
              selectedCategory: newSelectedCategory,
              selectedPrompt: newSelectedPrompt,
              searchIndex: createSearchIndex(newPrompts),
            }
          })

          return true
        } catch (error) {
          console.error("Error deleting subcategory:", error)
          return false
        }
      },

      // Analytics
      trackAction: async (promptId, action, userId) => {
        try {
          // Only track analytics if the database is seeded
          const { isSeeded } = get()
          if (!isSeeded) {
            console.warn("Skipping analytics tracking: Database not seeded")
            return
          }

          await trackPromptAction(promptId, action, userId)
        } catch (error) {
          console.error("Error tracking action:", error)
        }
      },
    }),
    {
      name: "prompt-library-storage",
      partialize: (state) => ({
        // Only persist the selected category and prompt IDs
        selectedCategory: state.selectedCategory,
        selectedPromptId: state.selectedPrompt?.id,
      }),
    },
  ),
)
