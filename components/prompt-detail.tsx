"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Copy, Download, Check, ChevronDown, LinkIcon, RefreshCw, Save, Trash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { VariableHighlight } from "@/components/variable-highlight"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth/auth-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { PromptWithVariables } from "@/lib/supabase/database.types"

interface PromptDetailProps {
  prompt: PromptWithVariables
  isAdminMode?: boolean
  onCopy: () => void
  onExport: () => void
  onShare?: () => void
}

export function PromptDetail({ prompt, isAdminMode = false, onCopy, onExport, onShare }: PromptDetailProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { updatePrompt, deletePrompt, categories, trackAction } = useStore()
  const [isCopied, setIsCopied] = useState(false)
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [editedContent, setEditedContent] = useState(prompt.content)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [editForm, setEditForm] = useState({
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    when_to_use: prompt.when_to_use,
    content: prompt.content,
    category_id: prompt.category_id,
    variables: prompt.variables || {},
  })

  // Update form when prompt changes
  useEffect(() => {
    setEditedContent(prompt.content)
    setEditForm({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      when_to_use: prompt.when_to_use,
      content: prompt.content,
      category_id: prompt.category_id,
      variables: prompt.variables || {},
    })
  }, [prompt])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedContent)
      setIsCopied(true)
      onCopy()

      // Track copy action
      trackAction(prompt.id, "copy", user?.id)

      toast({
        description: "Prompt copied to clipboard",
        duration: 1000,
      })

      setTimeout(() => {
        setIsCopied(false)
      }, 1000)
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy prompt",
      })
    }
  }

  const sharePrompt = async () => {
    try {
      // Get the current URL
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setIsLinkCopied(true)
      onShare?.()

      // Track share action
      trackAction(prompt.id, "share", user?.id)

      toast({
        description: "Link copied to clipboard",
        duration: 1000,
      })

      setTimeout(() => {
        setIsLinkCopied(false)
      }, 1000)
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy link",
      })
    }
  }

  const exportToMarkdown = () => {
    const markdown = `# ${prompt.title}\n\n${prompt.description}\n\n## When to use\n\n${prompt.when_to_use}\n\n## Prompt\n\n\`\`\`\n${prompt.content}\n\`\`\``

    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${prompt.title.toLowerCase().replace(/\s+/g, "-")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Track export action
    trackAction(prompt.id, "export", user?.id)
    onExport()
  }

  const handleSaveChanges = async () => {
    const success = await updatePrompt(editForm)
    if (success) {
      setIsEditing(false)
      toast({
        description: "Prompt updated successfully",
      })
    } else {
      toast({
        variant: "destructive",
        description: "Failed to update prompt",
      })
    }
  }

  const handleDeletePrompt = async () => {
    const success = await deletePrompt(prompt.id)
    if (success) {
      setIsDeleteDialogOpen(false)
      toast({
        description: "Prompt deleted successfully",
      })
    } else {
      toast({
        variant: "destructive",
        description: "Failed to delete prompt",
      })
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle Ctrl/Cmd+C for copying when specifically pressing those keys
    // Don't interfere with normal typing
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      // Don't prevent default if text is selected - let the browser handle normal copy
      if (window.getSelection()?.toString() === "") {
        e.preventDefault()
        copyToClipboard()
      }
    }
  }

  // Track view action on mount
  useEffect(() => {
    trackAction(prompt.id, "view", user?.id)
  }, [prompt.id, trackAction, user?.id])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#2E2E2E]">
        {isEditing ? (
          <Input
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="bg-[#1A1A1A] border-[#2E2E2E] text-lg font-semibold"
          />
        ) : (
          <h2 className="text-lg font-semibold truncate">{prompt.title}</h2>
        )}

        <div className="flex items-center space-x-2">
          {isAdminMode && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-[#3A9D42] border-[#3A9D42]"
            >
              Edit
            </Button>
          )}

          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveChanges}
                className="bg-[#3A9D42] hover:bg-[#2E8B57] text-[#0D0D0D]"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={sharePrompt}
                      className="p-2 rounded-md hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#3A9D42]"
                      aria-label="Share prompt"
                    >
                      {isLinkCopied ? <Check className="h-5 w-5 text-[#3A9D42]" /> : <LinkIcon className="h-5 w-5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share prompt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 rounded-md hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#3A9D42]"
                      aria-label="Copy prompt"
                    >
                      {isCopied ? <Check className="h-5 w-5 text-[#3A9D42]" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy prompt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 rounded-md hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#3A9D42] flex items-center"
                    aria-label="Export options"
                  >
                    <Download className="h-5 w-5 mr-1" />
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                  <DropdownMenuItem onClick={exportToMarkdown} className="cursor-pointer">
                    Export as Markdown
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={editForm.category_id}
              onValueChange={(value) => setEditForm({ ...editForm, category_id: value })}
            >
              <SelectTrigger className="bg-[#1A1A1A] border-[#2E2E2E]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2E2E2E]">
                {categories.flatMap((category) => [
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>,
                  ...(category.subcategories?.map((subcat) => (
                    <SelectItem key={subcat.id} value={subcat.id}>
                      {category.name} &gt; {subcat.name}
                    </SelectItem>
                  )) || []),
                ])}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="bg-[#1A1A1A] border-[#2E2E2E] min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whenToUse">When to Use</Label>
            <Textarea
              id="whenToUse"
              value={editForm.when_to_use}
              onChange={(e) => setEditForm({ ...editForm, when_to_use: e.target.value })}
              className="bg-[#1A1A1A] border-[#2E2E2E] min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Prompt Content</Label>
            <Textarea
              id="content"
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              className="bg-[#1A1A1A] border-[#2E2E2E] min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="h-4 w-4 mr-1" />
              Delete Prompt
            </Button>

            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveChanges}
                className="bg-[#3A9D42] hover:bg-[#2E8B57] text-[#0D0D0D]"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <h3 className="text-sm font-semibold text-gray-400">Description</h3>
            <p className="text-sm mt-1">{prompt.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400">When to use</h3>
            <p className="text-sm mt-1">{prompt.when_to_use}</p>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-400">Prompt</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="text-xs flex items-center gap-1 h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {isPreviewMode ? "Edit Mode" : "Preview Mode"}
              </Button>
            </div>

            <div className="mt-2 relative">
              {isPreviewMode ? (
                <div className="w-full h-[calc(100vh-350px)] min-h-[200px] p-3 rounded-md bg-[#1A1A1A] border border-[#2E2E2E] text-[#E5E5E5] overflow-y-auto font-mono text-sm">
                  <VariableHighlight content={editedContent} variables={prompt.variables} />
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-[calc(100vh-350px)] min-h-[200px] p-3 rounded-md bg-[#1A1A1A] border border-[#2E2E2E] text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#3A9D42] resize-none font-mono text-sm"
                  aria-label="Prompt content"
                  placeholder="Edit prompt here..."
                />
              )}
            </div>

            <div className="mt-2 flex justify-end space-x-2">
              {editedContent !== prompt.content && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditedContent(prompt.content)}
                  className="text-xs"
                >
                  Reset to original
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this prompt? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePrompt}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
