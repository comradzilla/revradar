import { createClient } from "@supabase/supabase-js"
import { mockCategories, mockPrompts } from "@/lib/mock-data"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("Starting database seeding process...")

    // Parse request body to check for force option
    const { force = false } = await request.json().catch(() => ({}))

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    // Check if database is already seeded
    const { data: existingCategories, error: checkError } = await supabaseAdmin.from("categories").select("id").limit(1)

    if (checkError) {
      console.error("Error checking existing data:", checkError)
      return NextResponse.json({ error: `Failed to check existing data: ${checkError.message}` }, { status: 500 })
    }

    if (existingCategories && existingCategories.length > 0) {
      if (!force) {
        console.log("Database already seeded, skipping...")
        return NextResponse.json({
          success: true,
          message: "Database already seeded",
        })
      } else {
        console.log("Force option enabled, clearing existing data...")

        // Delete existing data in reverse order of dependencies
        const { error: deletePromptsError } = await supabaseAdmin.from("prompts").delete().neq("id", "0")
        if (deletePromptsError) {
          console.error("Error deleting prompts:", deletePromptsError)
          return NextResponse.json(
            { error: `Failed to delete existing prompts: ${deletePromptsError.message}` },
            { status: 500 },
          )
        }

        const { error: deleteSubcategoriesError } = await supabaseAdmin.from("subcategories").delete().neq("id", "0")
        if (deleteSubcategoriesError) {
          console.error("Error deleting subcategories:", deleteSubcategoriesError)
          return NextResponse.json(
            { error: `Failed to delete existing subcategories: ${deleteSubcategoriesError.message}` },
            { status: 500 },
          )
        }

        const { error: deleteCategoriesError } = await supabaseAdmin.from("categories").delete().neq("id", "0")
        if (deleteCategoriesError) {
          console.error("Error deleting categories:", deleteCategoriesError)
          return NextResponse.json(
            { error: `Failed to delete existing categories: ${deleteCategoriesError.message}` },
            { status: 500 },
          )
        }
      }
    }

    console.log("Seeding categories...")
    // Step 1: Insert categories
    for (const category of mockCategories) {
      console.log(`Inserting category: ${category.name} (${category.id})`)

      // Check if this specific category already exists
      const { data: existingCategory, error: checkCategoryError } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("id", category.id)
        .single()

      if (checkCategoryError && checkCategoryError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected
        console.error(`Error checking if category ${category.id} exists:`, checkCategoryError)
        return NextResponse.json(
          { error: `Failed to check if category ${category.id} exists: ${checkCategoryError.message}` },
          { status: 500 },
        )
      }

      // Skip if category already exists
      if (existingCategory) {
        console.log(`Category ${category.id} already exists, skipping...`)
        continue
      }

      const { error: categoryError } = await supabaseAdmin.from("categories").insert({
        id: category.id,
        name: category.name,
        created_by: "system", // Use "system" as the creator for seeded data
      })

      if (categoryError) {
        console.error("Error inserting category:", categoryError)
        return NextResponse.json(
          { error: `Failed to insert category ${category.id}: ${categoryError.message}` },
          { status: 500 },
        )
      }

      // Step 2: Insert subcategories for this category
      if (category.subcategories && category.subcategories.length > 0) {
        console.log(`Inserting ${category.subcategories.length} subcategories for category: ${category.name}`)
        for (const subcategory of category.subcategories) {
          // Check if this specific subcategory already exists
          const { data: existingSubcategory, error: checkSubcategoryError } = await supabaseAdmin
            .from("subcategories")
            .select("id")
            .eq("id", subcategory.id)
            .single()

          if (checkSubcategoryError && checkSubcategoryError.code !== "PGRST116") {
            // PGRST116 is "not found" which is expected
            console.error(`Error checking if subcategory ${subcategory.id} exists:`, checkSubcategoryError)
            return NextResponse.json(
              { error: `Failed to check if subcategory ${subcategory.id} exists: ${checkSubcategoryError.message}` },
              { status: 500 },
            )
          }

          // Skip if subcategory already exists
          if (existingSubcategory) {
            console.log(`Subcategory ${subcategory.id} already exists, skipping...`)
            continue
          }

          const { error: subcategoryError } = await supabaseAdmin.from("subcategories").insert({
            id: subcategory.id,
            name: subcategory.name,
            category_id: category.id,
            created_by: "system", // Use "system" as the creator for seeded data
          })

          if (subcategoryError) {
            console.error("Error inserting subcategory:", subcategoryError)
            return NextResponse.json(
              { error: `Failed to insert subcategory ${subcategory.id}: ${subcategoryError.message}` },
              { status: 500 },
            )
          }
        }
      }
    }

    console.log("Seeding prompts...")
    // Step 3: Insert prompts
    for (const prompt of mockPrompts) {
      console.log(`Inserting prompt: ${prompt.title} (${prompt.id})`)

      // Check if this specific prompt already exists
      const { data: existingPrompt, error: checkPromptError } = await supabaseAdmin
        .from("prompts")
        .select("id")
        .eq("id", prompt.id)
        .single()

      if (checkPromptError && checkPromptError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected
        console.error(`Error checking if prompt ${prompt.id} exists:`, checkPromptError)
        return NextResponse.json(
          { error: `Failed to check if prompt ${prompt.id} exists: ${checkPromptError.message}` },
          { status: 500 },
        )
      }

      // Skip if prompt already exists
      if (existingPrompt) {
        console.log(`Prompt ${prompt.id} already exists, skipping...`)
        continue
      }

      const { error: promptError } = await supabaseAdmin.from("prompts").insert({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        when_to_use: prompt.whenToUse,
        content: prompt.content,
        category_id: prompt.categoryId,
        variables: prompt.variables || {},
        status: "approved", // Set status to approved for seeded data
        created_by: "system", // Use "system" as the creator for seeded data
        approved_by: "system", // Use "system" as the approver for seeded data
        approved_at: new Date().toISOString(), // Set approval date to now
      })

      if (promptError) {
        console.error("Error inserting prompt:", promptError)
        return NextResponse.json(
          { error: `Failed to insert prompt ${prompt.id}: ${promptError.message}` },
          { status: 500 },
        )
      }
    }

    console.log("Database seeding completed successfully!")
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    })
  } catch (error: any) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Add a GET endpoint to check seeding status
export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    // Check if database is already seeded
    const { data: categories, error: categoriesError } = await supabaseAdmin.from("categories").select("id, name")

    if (categoriesError) {
      return NextResponse.json({ error: `Failed to check seeding status: ${categoriesError.message}` }, { status: 500 })
    }

    const { data: prompts, error: promptsError } = await supabaseAdmin.from("prompts").select("id")

    if (promptsError) {
      return NextResponse.json({ error: `Failed to check seeding status: ${promptsError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      isSeeded: categories && categories.length > 0 && prompts && prompts.length > 0,
      categoriesCount: categories ? categories.length : 0,
      promptsCount: prompts ? prompts.length : 0,
      categories: categories || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
