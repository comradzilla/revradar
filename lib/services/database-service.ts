"use client"

import { supabase } from "@/lib/supabase/client"
import type {
  CategoryWithSubcategories,
  PromptWithVariables,
  Category,
  Subcategory,
  Prompt,
  Role,
  AuditLog,
} from "@/lib/supabase/database.types"

// Categories
export async function getCategories(): Promise<CategoryWithSubcategories[]> {
  // Fetch all categories
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
    return []
  }

  // Fetch all subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from("subcategories")
    .select("*")
    .order("name")

  if (subcategoriesError) {
    console.error("Error fetching subcategories:", subcategoriesError)
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      subcategories: [],
    }))
  }

  // Combine categories with their subcategories
  return categories.map((category) => {
    const categorySubcategories = subcategories
      .filter((subcategory) => subcategory.category_id === category.id)
      .map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
      }))

    return {
      id: category.id,
      name: category.name,
      subcategories: categorySubcategories,
    }
  })
}

export async function createCategory(
  category: Omit<Category, "created_at" | "updated_at" | "created_by">,
  userId: string,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...category, created_by: userId })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    return null
  }

  return data
}

export async function updateCategory(
  category: Omit<Category, "created_at" | "updated_at" | "created_by">,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .update({ name: category.name, updated_at: new Date().toISOString() })
    .eq("id", category.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating category:", error)
    return null
  }

  return data
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("id", categoryId)

  if (error) {
    console.error("Error deleting category:", error)
    return false
  }

  return true
}

// Subcategories
export async function createSubcategory(
  subcategory: Omit<Subcategory, "created_at" | "updated_at" | "created_by">,
  userId: string,
): Promise<Subcategory | null> {
  const { data, error } = await supabase
    .from("subcategories")
    .insert({ ...subcategory, created_by: userId })
    .select()
    .single()

  if (error) {
    console.error("Error creating subcategory:", error)
    return null
  }

  return data
}

export async function updateSubcategory(
  subcategory: Omit<Subcategory, "created_at" | "updated_at" | "created_by">,
): Promise<Subcategory | null> {
  const { data, error } = await supabase
    .from("subcategories")
    .update({ name: subcategory.name, updated_at: new Date().toISOString() })
    .eq("id", subcategory.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating subcategory:", error)
    return null
  }

  return data
}

export async function deleteSubcategory(subcategoryId: string): Promise<boolean> {
  const { error } = await supabase.from("subcategories").delete().eq("id", subcategoryId)

  if (error) {
    console.error("Error deleting subcategory:", error)
    return false
  }

  return true
}

// Prompts
export async function getPrompts(): Promise<PromptWithVariables[]> {
  const { data, error } = await supabase.from("prompts").select("*").order("title")

  if (error) {
    console.error("Error fetching prompts:", error)
    return []
  }

  return data.map((prompt) => ({
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    when_to_use: prompt.when_to_use,
    content: prompt.content,
    category_id: prompt.category_id,
    status: prompt.status || "approved", // Default for backward compatibility
    created_by: prompt.created_by,
    variables: (prompt.variables as Record<string, { name: string; description: string; example?: string }>) || {},
  }))
}

export async function getPromptById(promptId: string): Promise<PromptWithVariables | null> {
  const { data, error } = await supabase.from("prompts").select("*").eq("id", promptId).single()

  if (error) {
    console.error("Error fetching prompt:", error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    when_to_use: data.when_to_use,
    content: data.content,
    category_id: data.category_id,
    status: data.status || "approved", // Default for backward compatibility
    created_by: data.created_by,
    variables: (data.variables as Record<string, { name: string; description: string; example?: string }>) || {},
  }
}

export async function createPrompt(
  prompt: Omit<Prompt, "created_at" | "updated_at" | "created_by" | "status" | "approved_by" | "approved_at">,
  userId: string,
  status = "draft",
): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from("prompts")
    .insert({ ...prompt, created_by: userId, status })
    .select()
    .single()

  if (error) {
    console.error("Error creating prompt:", error)
    return null
  }

  return data
}

export async function updatePrompt(
  prompt: Omit<Prompt, "created_at" | "updated_at" | "created_by" | "approved_by" | "approved_at">,
): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from("prompts")
    .update({
      title: prompt.title,
      description: prompt.description,
      when_to_use: prompt.when_to_use,
      content: prompt.content,
      category_id: prompt.category_id,
      variables: prompt.variables,
      status: prompt.status || "draft", // Default to draft on update
      updated_at: new Date().toISOString(),
    })
    .eq("id", prompt.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating prompt:", error)
    return null
  }

  return data
}

export async function approvePrompt(promptId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("prompts")
    .update({
      status: "approved",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    })
    .eq("id", promptId)

  if (error) {
    console.error("Error approving prompt:", error)
    return false
  }

  return true
}

export async function deletePrompt(promptId: string): Promise<boolean> {
  const { error } = await supabase.from("prompts").delete().eq("id", promptId)

  if (error) {
    console.error("Error deleting prompt:", error)
    return false
  }

  return true
}

// Check if prompt exists in database
export async function checkPromptExists(promptId: string): Promise<boolean> {
  const { data, error } = await supabase.from("prompts").select("id").eq("id", promptId).single()

  if (error || !data) {
    return false
  }

  return true
}

// Analytics
export async function trackPromptAction(promptId: string, action: string, userId?: string): Promise<boolean> {
  // First check if the prompt exists in the database
  const promptExists = await checkPromptExists(promptId)

  if (!promptExists) {
    console.warn(`Skipping analytics tracking: Prompt with ID ${promptId} does not exist in the database`)
    return false
  }

  const { error } = await supabase.from("prompt_analytics").insert({
    prompt_id: promptId,
    user_id: userId || null,
    action,
  })

  if (error) {
    console.error("Error tracking prompt action:", error)
    return false
  }

  return true
}

export async function getPromptAnalytics(promptId?: string): Promise<any[]> {
  let query = supabase.from("prompt_analytics").select("*").order("created_at", { ascending: false })

  if (promptId) {
    query = query.eq("prompt_id", promptId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching analytics:", error)
    return []
  }

  return data
}

// Check if database has been seeded
export async function isDatabaseSeeded(): Promise<boolean> {
  const { data, error } = await supabase.from("categories").select("id").limit(1)

  if (error || !data || data.length === 0) {
    return false
  }

  return true
}

// Role-based access control
export async function getUserRoles(userId: string): Promise<Role[]> {
  const { data, error } = await supabase.from("user_roles").select("roles(*)").eq("user_id", userId)

  if (error) {
    console.error("Error fetching user roles:", error)
    return []
  }

  return data.map((item) => item.roles) as Role[]
}

export async function assignRoleToUser(userId: string, roleId: number): Promise<boolean> {
  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: roleId,
  })

  if (error) {
    console.error("Error assigning role to user:", error)
    return false
  }

  return true
}

export async function removeRoleFromUser(userId: string, roleId: number): Promise<boolean> {
  const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role_id", roleId)

  if (error) {
    console.error("Error removing role from user:", error)
    return false
  }

  return true
}

export async function getRoles(): Promise<Role[]> {
  const { data, error } = await supabase.from("roles").select("*").order("id")

  if (error) {
    console.error("Error fetching roles:", error)
    return []
  }

  return data
}

// Audit logs
export async function getAuditLogs(
  tableName?: string,
  recordId?: string,
  userId?: string,
  limit = 100,
): Promise<AuditLog[]> {
  let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit)

  if (tableName) {
    query = query.eq("table_name", tableName)
  }

  if (recordId) {
    query = query.eq("record_id", recordId)
  }

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }

  return data
}
