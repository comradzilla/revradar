"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VariableDefinition {
  name: string
  description: string
  example?: string
}

interface VariableHighlightProps {
  content: string
  variables?: Record<string, VariableDefinition>
}

export function VariableHighlight({ content, variables = {} }: VariableHighlightProps) {
  // Split content by variable pattern {{variable_name}}
  const parts = content.split(/(\{\{[^}]+\}\})/g)

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part is a variable
        const match = part.match(/^\{\{([^}]+)\}\}$/)

        if (match) {
          const varName = match[1]
          const varInfo = variables[varName] || {
            name: varName,
            description: "Replace with your value",
          }

          return (
            <TooltipProvider key={index} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="variable-highlight" data-variable={varName}>
                    {part}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{varInfo.name}</p>
                    <p className="text-xs">{varInfo.description}</p>
                    {varInfo.example && <p className="text-xs italic">Example: {varInfo.example}</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        }

        // Regular text
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
