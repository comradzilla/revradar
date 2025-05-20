"use client"

import { useEffect, useState } from "react"
import { Command } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ShortcutProps {
  keys: string[]
  description: string
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index}>
            {index > 0 && <span className="mx-1">+</span>}
            <kbd className="px-2 py-1 text-xs font-semibold bg-[#0D0D0D] border border-[#2E2E2E] rounded">{key}</kbd>
          </span>
        ))}
      </div>
    </div>
  )
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  // Handle keyboard shortcut to open shortcuts dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open shortcuts dialog with ? key
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Keyboard shortcuts">
          <Command className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-[#2E2E2E]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Keyboard shortcuts to help you navigate the app faster.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[#00FF7F]">Navigation</h3>
            <div className="space-y-2">
              <Shortcut keys={["↑", "↓"]} description="Navigate between prompts" />
              <Shortcut keys={["←", "→"]} description="Navigate between categories" />
              <Shortcut keys={["Enter"]} description="Select prompt or category" />
              <Shortcut keys={["Esc"]} description="Clear search or close dialogs" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[#00FF7F]">Actions</h3>
            <div className="space-y-2">
              <Shortcut keys={["Ctrl/⌘", "F"]} description="Focus search" />
              <Shortcut keys={["Ctrl/⌘", "C"]} description="Copy current prompt" />
              <Shortcut keys={["Ctrl/⌘", "S"]} description="Share current prompt" />
              <Shortcut keys={["Ctrl/⌘", "E"]} description="Export current prompt" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[#00FF7F]">Other</h3>
            <div className="space-y-2">
              <Shortcut keys={["?"]} description="Show keyboard shortcuts" />
              <Shortcut keys={["Ctrl/⌘", "K"]} description="Quick navigation" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
