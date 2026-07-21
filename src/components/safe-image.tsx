"use client"

import { useState, useCallback, ComponentProps } from "react"
import Image from "next/image"
import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type SafeImageProps = Omit<ComponentProps<typeof Image>, "src"> & {
  src: string | null | undefined
  alt: string
}

const ALLOWED_PROTOCOLS = ["http:", "https:"]
const BLOCKED_PATTERNS = [/^javascript:/i, /^data:/i, /^vbscript:/i]

function isUrlSafe(url: string): boolean {
  if (!url || url.trim().length === 0) return false
  if (BLOCKED_PATTERNS.some((p) => p.test(url))) return false
  try {
    const parsed = new URL(url)
    return ALLOWED_PROTOCOLS.includes(parsed.protocol)
  } catch {
    return url.startsWith("/")
  }
}

export function SafeImage({ src, alt, className, onError, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true)
      setIsLoading(false)
      if (onError) onError(e)
    },
    [onError],
  )

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (!src || !isUrlSafe(src) || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500",
          className,
        )}
      >
        <ImageOff className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
      <Image
        src={src}
        alt={alt}
        className={cn("transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={src.startsWith("/")}
        {...props}
      />
    </div>
  )
}
