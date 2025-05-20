"use client"

import { useState } from "react"
import { Plus, Edit, Trash, ChevronRight } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CategoryManager() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useStore()
  const { toast } = useToast()

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false)
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false)
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState(false)
  const [isDeleteSubcategoryOpen, setIsDeleteSubcategoryOpen] = useState(false)

  const [newCategory, setNewCategory] = useState({ id: "", name: "" })
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null)
  const [newSubcategory, setNewSubcategory] = useState({ id: "", name: "" })
  const [editingSubcategory, setEditingSubcategory] = useState<{ id: string; name: string; parentId: string } | null>(
    null,
  )
  const [deletingSubcategoryInfo, setDeletingSubcategoryInfo] = useState<{ id: string; parentId: string } | null>(null)

  // Helper to generate ID from name
  const generateId = (name: string) => name.toLowerCase().replace(/\s+/g, "-")

  // Category CRUD operations
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        variant: "destructive",
        description: "Category name is required",
      })
      return
    }

    const id = newCategory.id || generateId(newCategory.name)

    // Check for duplicate ID
    if (categories.some((c) => c.id === id)) {
      toast({
        variant: "destructive",
        description: "A category with this ID already exists",
      })
      return
    }

    addCategory({ id, name: newCategory.name, subcategories: [] })
    setNewCategory({ id: "", name: "" })
    setIsAddCategoryOpen(false)

    toast({
      description: "Category added successfully",
    })
  }

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        variant: "destructive",
        description: "Category name is required",
      })
      return
    }

    updateCategory(editingCategory)
    setEditingCategory(null)
    setIsEditCategoryOpen(false)

    toast({
      description: "Category updated successfully",
    })
  }

  const handleDeleteCategory = () => {
    if (!deletingCategoryId) return

    deleteCategory(deletingCategoryId)
    setDeletingCategoryId(null)
    setIsDeleteCategoryOpen(false)

    toast({
      description: "Category deleted successfully",
    })
  }

  // Subcategory CRUD operations
  const handleAddSubcategory = () => {
    if (!parentCategoryId || !newSubcategory.name.trim()) {
      toast({
        variant: "destructive",
        description: "Subcategory name is required",
      })
      return
    }

    const id = newSubcategory.id || generateId(newSubcategory.name)

    // Check for duplicate ID
    const parentCategory = categories.find((c) => c.id === parentCategoryId)
    if (parentCategory?.subcategories?.some((s) => s.id === id)) {
      toast({
        variant: "destructive",
        description: "A subcategory with this ID already exists",
      })
      return
    }

    addSubcategory(parentCategoryId, { id, name: newSubcategory.name })
    setNewSubcategory({ id: "", name: "" })
    setParentCategoryId(null)
    setIsAddSubcategoryOpen(false)

    toast({
      description: "Subcategory added successfully",
    })
  }

  const handleUpdateSubcategory = () => {
    if (!editingSubcategory || !editingSubcategory.name.trim()) {
      toast({
        variant: "destructive",
        description: "Subcategory name is required",
      })
      return
    }

    updateSubcategory(editingSubcategory.parentId, {
      id: editingSubcategory.id,
      name: editingSubcategory.name,
    })
    setEditingSubcategory(null)
    setIsEditSubcategoryOpen(false)

    toast({
      description: "Subcategory updated successfully",
    })
  }

  const handleDeleteSubcategory = () => {
    if (!deletingSubcategoryInfo) return

    deleteSubcategory(deletingSubcategoryInfo.parentId, deletingSubcategoryInfo.id)
    setDeletingSubcategoryInfo(null)
    setIsDeleteSubcategoryOpen(false)

    toast({
      description: "Subcategory deleted successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <Button onClick={() => setIsAddCategoryOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="bg-[#1A1A1A] border-[#2E2E2E]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center">
                <CardTitle className="text-md font-medium">{category.name}</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  className="ml-2 h-7 px-2 bg-[#3A9D42] hover:bg-[#2E8B57] text-white"
                  onClick={() => {
                    setEditingCategory({ id: category.id, name: category.name })
                    setIsEditCategoryOpen(true)
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParentCategoryId(category.id)
                    setIsAddSubcategoryOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subcategory
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeletingCategoryId(category.id)
                    setIsDeleteCategoryOpen(true)
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {category.subcategories && category.subcategories.length > 0 ? (
                <ul className="space-y-2">
                  {category.subcategories.map((subcategory) => (
                    <li
                      key={subcategory.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-[#2E2E2E]"
                    >
                      <div className="flex items-center">
                        <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{subcategory.name}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="ml-2 h-6 px-2 bg-[#3A9D42] hover:bg-[#2E8B57] text-white"
                          onClick={() => {
                            setEditingSubcategory({
                              id: subcategory.id,
                              name: subcategory.name,
                              parentId: category.id,
                            })
                            setIsEditSubcategoryOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setDeletingSubcategoryInfo({
                            id: subcategory.id,
                            parentId: category.id,
                          })
                          setIsDeleteSubcategoryOpen(true)
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No subcategories</p>
              )}
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No categories defined yet</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddCategoryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Category
            </Button>
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Add a new top-level category to organize prompts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="categoryName" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => {
                  setNewCategory({
                    ...newCategory,
                    name: e.target.value,
                    id: generateId(e.target.value),
                  })
                }}
                placeholder="e.g., Marketing"
                className="bg-[#0D0D0D] border-[#2E2E2E]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                Category ID (auto-generated)
              </label>
              <Input
                id="categoryId"
                value={newCategory.id || generateId(newCategory.name)}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                placeholder="e.g., marketing"
                className="bg-[#0D0D0D] border-[#2E2E2E] font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Used in URLs and for internal reference. Auto-generated from name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="editCategoryName" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="editCategoryName"
                value={editingCategory?.name || ""}
                onChange={(e) => setEditingCategory((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                placeholder="e.g., Marketing"
                className="bg-[#0D0D0D] border-[#2E2E2E]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editCategoryId" className="text-sm font-medium">
                Category ID (cannot be changed)
              </label>
              <Input
                id="editCategoryId"
                value={editingCategory?.id || ""}
                disabled
                className="bg-[#0D0D0D] border-[#2E2E2E] font-mono text-sm opacity-60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This will also delete all subcategories and associated
              prompts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCategoryOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubcategoryOpen} onOpenChange={setIsAddSubcategoryOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory to{" "}
              {categories.find((c) => c.id === parentCategoryId)?.name || "the selected category"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="subcategoryName" className="text-sm font-medium">
                Subcategory Name
              </label>
              <Input
                id="subcategoryName"
                value={newSubcategory.name}
                onChange={(e) => {
                  setNewSubcategory({
                    ...newSubcategory,
                    name: e.target.value,
                    id: generateId(e.target.value),
                  })
                }}
                placeholder="e.g., Email Marketing"
                className="bg-[#0D0D0D] border-[#2E2E2E]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="subcategoryId" className="text-sm font-medium">
                Subcategory ID (auto-generated)
              </label>
              <Input
                id="subcategoryId"
                value={newSubcategory.id || generateId(newSubcategory.name)}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, id: e.target.value })}
                placeholder="e.g., email-marketing"
                className="bg-[#0D0D0D] border-[#2E2E2E] font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Used in URLs and for internal reference. Auto-generated from name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubcategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubcategoryOpen} onOpenChange={setIsEditSubcategoryOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="editSubcategoryName" className="text-sm font-medium">
                Subcategory Name
              </label>
              <Input
                id="editSubcategoryName"
                value={editingSubcategory?.name || ""}
                onChange={(e) => setEditingSubcategory((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                placeholder="e.g., Email Marketing"
                className="bg-[#0D0D0D] border-[#2E2E2E]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editSubcategoryId" className="text-sm font-medium">
                Subcategory ID (cannot be changed)
              </label>
              <Input
                id="editSubcategoryId"
                value={editingSubcategory?.id || ""}
                disabled
                className="bg-[#0D0D0D] border-[#2E2E2E] font-mono text-sm opacity-60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubcategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubcategory}>Update Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Dialog */}
      <Dialog open={isDeleteSubcategoryOpen} onOpenChange={setIsDeleteSubcategoryOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle>Delete Subcategory</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subcategory? This will also delete all associated prompts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteSubcategoryOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubcategory}>
              Delete Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
