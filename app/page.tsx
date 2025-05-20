import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#0D0D0D] p-8 md:p-12">
      {/* Hero Section */}
      <div className="mb-16 md:mb-24" id="top">
        <h1 className="text-3xl md:text-4xl font-mono font-normal tracking-tighter text-[#E5E5E5]">
          revradar<span className="text-[#3A9D42]">.io</span>
        </h1>
        <p className="mt-2 text-lg md:text-xl font-mono text-[#999999]">gtm 2.0</p>
        <div className="mt-4 inline-flex items-center text-[#3A9D42] hover:text-[#2E8B57] transition-colors">
          <span className="font-mono text-sm">building the future of go-to-market</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>

        <div className="mt-8">
          <a
            href="https://calendly.com/ashkan-naderi/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-[#3A9D42] text-[#0D0D0D] rounded-md font-mono text-sm hover:bg-[#2E8B57] transition-colors"
          >
            let&apos;s chat →
          </a>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-12 mb-24">
        <div>
          <Link href="/prompt-library" className="group">
            <h2 className="font-mono text-xl font-normal text-[#E5E5E5] group-hover:text-[#3A9D42] transition-colors">
              prompt library
            </h2>
            <p className="mt-1 font-mono text-sm text-[#999999]">
              copy-ready prompts for gtm teams. optimized for sales, marketing, and customer success.
            </p>
          </Link>
        </div>

        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed">
                  <h2 className="font-mono text-xl font-normal text-[#666666] flex items-center">
                    ai workflows
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                  </h2>
                  <p className="mt-1 font-mono text-sm text-[#666666]">
                    automated sequences that connect your tools, data, and ai models.
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5] max-w-xs">
                <p className="text-sm">
                  We&apos;re building AI workflows to automate your GTM processes. This feature is coming soon!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed">
                  <h2 className="font-mono text-xl font-normal text-[#666666] flex items-center">
                    ai agents
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                  </h2>
                  <p className="mt-1 font-mono text-sm text-[#666666]">
                    purpose-built ai agents that execute specific gtm functions autonomously.
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5] max-w-xs">
                <p className="text-sm">Our AI agents will help automate your GTM tasks. This feature is coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed">
                  <h2 className="font-mono text-xl font-normal text-[#666666] flex items-center">
                    fractional
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#2E2E2E] rounded text-[#999999]">soon</span>
                  </h2>
                  <p className="mt-1 font-mono text-sm text-[#666666]">
                    on-demand sales, revops, and bizdev experts augmented with ai.
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1A1A1A] border-[#2E2E2E] text-[#E5E5E5] max-w-xs">
                <p className="text-sm">Access our network of fractional GTM experts. This service is coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-8 border-t border-[#2E2E2E]">
        <p className="font-mono text-xs text-[#666666]">© {new Date().getFullYear()} revradar.io</p>
        <div className="mt-4 flex space-x-6">
          <a
            href="mailto:ashkan@revradar.io"
            className="font-mono text-xs text-[#666666] hover:text-[#3A9D42] transition-colors"
          >
            contact
          </a>
          <a
            href="https://www.linkedin.com/in/ashkan-naderi/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[#666666] hover:text-[#3A9D42] transition-colors"
          >
            linkedin
          </a>
        </div>
      </footer>
    </main>
  )
}
