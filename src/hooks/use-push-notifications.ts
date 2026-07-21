"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [supported, setSupported] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const subscribe = async () => {
    if (!supported) return null

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result !== "granted") return null

    try {
      const registration = await navigator.serviceWorker.ready
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY || "",
      })

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: user.id,
        }),
      })

      return subscription
    } catch (err) {
      console.error("Push subscription failed:", err)
      return null
    }
  }

  return { permission, supported, subscribe }
}
