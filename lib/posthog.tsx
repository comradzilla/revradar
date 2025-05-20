"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import posthog from "posthog-js"

type PostHogContextType = typeof posthog | null

const PostHogContext = createContext<PostHogContextType>(null)

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [client, setClient] = useState<typeof posthog | null>(null)

  useEffect(() => {
    // Initialize PostHog only on the client side
    if (typeof window !== "undefined") {
      // This would normally use environment variables
      // For demo purposes, we're using a placeholder API key
      posthog.init("phc_placeholder", {
        api_host: "https://app.posthog.com",
        // Disable capturing by default until user opts in
        capture_pageview: false,
        // Disable autocapture to respect user privacy
        autocapture: false,
      })
      setClient(posthog)
    }

    return () => {
      if (client) {
        client.shutdown()
      }
    }
  }, [])

  return <PostHogContext.Provider value={client}>{children}</PostHogContext.Provider>
}

export const usePostHog = () => useContext(PostHogContext)
