/**
 * Spinner Component
 * 
 * A reusable loading spinner component with configurable size and styling.
 * Used throughout the application to indicate loading states.
 */
import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div 
      className={`animate-spin rounded-full border-t-2 border-b-2 border-[#3A9D42] ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
