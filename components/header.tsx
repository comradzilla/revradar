"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, isAdmin } = useAuth()

  return (
    <header className="py-6 px-8 md:px-12">
      <div className="flex justify-between items-center">
        <Link href="/" className="font-mono font-normal text-base text-[#E5E5E5]">
          revradar<span className="text-[#3A9D42]">.io</span>
        </Link>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-5 w-5 text-[#E5E5E5]" /> : <Menu className="h-5 w-5 text-[#E5E5E5]" />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/prompt-library"
            className="font-mono text-sm text-[#999999] hover:text-[#3A9D42] transition-colors"
          >
            prompt library
          </Link>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-sm text-[#666666] cursor-not-allowed flex items-center">
                  ai workflows
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                <p className="text-xs">
                  Coming soon! Automated sequences that connect your tools, data, and AI models.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-sm text-[#666666] cursor-not-allowed flex items-center">
                  ai agents
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                <p className="text-xs">
                  Coming soon! Purpose-built AI agents that execute specific GTM functions autonomously.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-sm text-[#666666] cursor-not-allowed flex items-center">
                  fractional
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                <p className="text-xs">Coming soon! On-demand sales, revops, and bizdev experts augmented with AI.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2E2E2E]" />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()} className="text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#3A9D42] hover:bg-[#2E8B57] text-[#0D0D0D]">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/prompt-library"
              className="font-mono text-sm text-[#999999] hover:text-[#3A9D42] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              prompt library
            </Link>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-sm text-[#666666] cursor-not-allowed flex items-center">
                    ai workflows
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                  <p className="text-xs">
                    Coming soon! Automated sequences that connect your tools, data, and AI models.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-sm text-[#666666] cursor-not-allowed flex items-center">
                    ai agents
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                  <p className="text-xs">
                    Coming soon! Purpose-built AI agents that execute specific GTM functions autonomously.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-sm text-[#666666] cursor-not-allowed flex items-center">
                    fractional
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5]">
                  <p className="text-xs">Coming soon! On-demand sales, revops, and bizdev experts augmented with AI.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="font-mono text-sm text-[#3A9D42] hover:text-[#2E8B57] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="font-mono text-sm text-red-500 hover:text-red-400 transition-colors flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="font-mono text-sm text-[#3A9D42] hover:text-[#2E8B57] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="font-mono text-sm text-[#3A9D42] hover:text-[#2E8B57] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
