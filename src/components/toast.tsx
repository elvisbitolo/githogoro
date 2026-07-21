"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastItem {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastItem["type"], duration?: number) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  dismissAll: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const BG_COLORS = {
  success: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
  error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  warning: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
}

const TEXT_COLORS = {
  success: "text-emerald-800 dark:text-emerald-200",
  error: "text-red-800 dark:text-red-200",
  info: "text-blue-800 dark:text-blue-200",
  warning: "text-amber-800 dark:text-amber-200",
}

const ICON_COLORS = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-amber-500",
}

const CLOSE_COLORS = {
  success: "hover:bg-emerald-100 dark:hover:bg-emerald-900",
  error: "hover:bg-red-100 dark:hover:bg-red-900",
  info: "hover:bg-blue-100 dark:hover:bg-blue-900",
  warning: "hover:bg-amber-100 dark:hover:bg-amber-900",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current.clear()
    setToasts([])
  }, [])

  const toast = useCallback(
    (message: string, type: ToastItem["type"] = "info", duration = 5000) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [{ id, message, type, duration }, ...prev])

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id)
        }, duration)
        timersRef.current.set(id, timer)
      }
    },
    [dismiss]
  )

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismissAll }}>
      {children}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg",
                "animate-in slide-in-from-right-full fade-in duration-300",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full",
                BG_COLORS[t.type]
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", ICON_COLORS[t.type])} />
              <p className={cn("text-sm font-medium flex-1 leading-relaxed", TEXT_COLORS[t.type])}>
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className={cn(
                  "shrink-0 h-6 w-6 flex items-center justify-center rounded-lg transition-colors",
                  TEXT_COLORS[t.type],
                  CLOSE_COLORS[t.type]
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
