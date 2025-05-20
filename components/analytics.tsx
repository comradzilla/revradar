"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { usePostHog } from "@/lib/posthog"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (posthog) {
      posthog.capture("$pageview")
    }
  }, [pathname, searchParams, posthog])

  return null
}
