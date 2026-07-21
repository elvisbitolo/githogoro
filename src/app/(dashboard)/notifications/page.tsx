"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Bell,
  BellRing,
  Heart,
  MessageSquare,
  AlertTriangle,
  Siren,
  Calendar,
  Briefcase,
  UserPlus,
  Settings,
  CheckCheck,
  Filter,
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  isRead: boolean
  fromUserId: string | null
  entityId: string | null
  entityType: string | null
  createdAt: string
}

const URGENT_TYPES = ["announcement", "obituary"]
const ACTION_TYPES = [
  "harambee_donation",
  "harambee_update",
  "tontine_reminder",
  "loan_request",
  "loan_repayment",
  "errand_request",
  "errand_accepted",
  "complaint_update",
]
const COMMUNITY_TYPES = [
  "event_invite",
  "event_rsvp",
  "volunteer_call",
  "petition_signature",
  "skill_hired",
  "share_post",
]
const SOCIAL_TYPES = [
  "follow",
  "like_post",
  "comment_post",
  "mention",
  "message",
  "birthday",
]

function getCategory(type: string): "urgent" | "action" | "community" | "social" {
  if (URGENT_TYPES.includes(type)) return "urgent"
  if (ACTION_TYPES.includes(type)) return "action"
  if (COMMUNITY_TYPES.includes(type)) return "community"
  return "social"
}

function getCategoryColor(category: "urgent" | "action" | "community" | "social") {
  switch (category) {
    case "urgent":
      return {
        border: "border-l-red-500",
        bg: "bg-red-50/50",
        icon: "text-red-500",
        badge: "destructive" as const,
      }
    case "action":
      return {
        border: "border-l-amber-500",
        bg: "bg-amber-50/50",
        icon: "text-amber-500",
        badge: "warning" as const,
      }
    case "community":
      return {
        border: "border-l-blue-500",
        bg: "bg-blue-50/50",
        icon: "text-blue-500",
        badge: "info" as const,
      }
    case "social":
      return {
        border: "border-l-emerald-500",
        bg: "bg-emerald-50/50",
        icon: "text-emerald-500",
        badge: "default" as const,
      }
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "like_post":
      return <Heart className="h-4 w-4" />
    case "comment_post":
    case "mention":
      return <MessageSquare className="h-4 w-4" />
    case "follow":
      return <UserPlus className="h-4 w-4" />
    case "event_invite":
    case "event_rsvp":
      return <Calendar className="h-4 w-4" />
    case "volunteer_call":
    case "skill_hired":
    case "errand_request":
    case "errand_accepted":
      return <Briefcase className="h-4 w-4" />
    case "announcement":
    case "obituary":
      return <AlertTriangle className="h-4 w-4" />
    case "harambee_donation":
    case "harambee_update":
    case "tontine_reminder":
    case "loan_request":
    case "loan_repayment":
      return <Siren className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

function getCategoryLabel(type: string): string {
  const category = getCategory(type)
  switch (category) {
    case "urgent":
      return "URGENT"
    case "action":
      return "ACTION NEEDED"
    case "community":
      return "COMMUNITY"
    case "social":
      return "SOCIAL"
  }
}

function formatTypeLabel(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const supabase = createClient()

  const fetchNotifications = useCallback(async (unreadOnly?: boolean) => {
    try {
      const params = new URLSearchParams()
      if (unreadOnly) params.set("unread", "true")

      const res = await fetch(`/api/notifications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          fetchNotifications(filter === "unread")
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchNotifications, filter])

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await fetch(`/api/notifications/${notificationId}/read`, { method: "PUT" })
  }

  const markAllAsRead = async () => {
    setMarkingAllRead(true)
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } finally {
      setMarkingAllRead(false)
    }
  }

  const getFilteredNotifications = (tab: string): Notification[] => {
    switch (tab) {
      case "unread":
        return notifications.filter((n) => !n.isRead)
      case "urgent":
        return notifications.filter(
          (n) => getCategory(n.type) === "urgent" || getCategory(n.type) === "action"
        )
      case "community":
        return notifications.filter((n) => getCategory(n.type) === "community")
      case "social":
        return notifications.filter((n) => getCategory(n.type) === "social")
      default:
        return notifications
    }
  }

  const renderNotification = (notification: Notification) => {
    const category = getCategory(notification.type)
    const colors = getCategoryColor(category)

    return (
      <Card
        key={notification.id}
        className={`border-l-4 transition-all cursor-pointer ${colors.border} ${
          !notification.isRead ? colors.bg : ""
        } hover:shadow-md`}
        onClick={() => {
          if (!notification.isRead) markAsRead(notification.id)
          if (notification.link) {
            window.location.href = notification.link
          }
        }}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex-shrink-0 ${colors.icon}`}>
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3
                  className={`text-sm ${
                    !notification.isRead ? "font-semibold" : "font-medium"
                  }`}
                >
                  {notification.title}
                </h3>
                <Badge variant={colors.badge} className="text-[10px] px-1.5 py-0">
                  {getCategoryLabel(notification.type)}
                </Badge>
                {!notification.isRead && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                )}
              </div>
              {notification.body && (
                <p className="text-sm text-zinc-600 line-clamp-2">{notification.body}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-zinc-400">
                  {formatRelativeTime(notification.createdAt)}
                  <span className="mx-1.5">·</span>
                  {formatTypeLabel(notification.type)}
                </p>
                {notification.link && (
                  <span className="text-xs text-emerald-600 font-medium">View →</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmpty = (message: string, submessage: string) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Bell className="h-12 w-12 text-zinc-300 mb-4" />
        <p className="text-zinc-500 font-medium">{message}</p>
        <p className="text-sm text-zinc-400 mt-1">{submessage}</p>
      </CardContent>
    </Card>
  )

  const renderNotifications = (filtered: Notification[]) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 bg-zinc-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-2/3" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                    <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (filtered.length === 0) {
      return renderEmpty(
        "No notifications",
        "You're all caught up! Check back later."
      )
    }

    return (
      <div className="space-y-3">
        {filtered.map((notification) => renderNotification(notification))}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={markingAllRead}
              className="gap-1.5 text-zinc-600"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-zinc-500">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-1.5">
            <BellRing className="h-3.5 w-3.5" />
            Unread
            {unreadCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-600 text-[10px] text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="urgent" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Urgent
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Community
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderNotifications(getFilteredNotifications("all"))}
        </TabsContent>
        <TabsContent value="unread">
          {renderNotifications(getFilteredNotifications("unread"))}
        </TabsContent>
        <TabsContent value="urgent">
          {renderNotifications(getFilteredNotifications("urgent"))}
        </TabsContent>
        <TabsContent value="community">
          {renderNotifications(getFilteredNotifications("community"))}
        </TabsContent>
        <TabsContent value="social">
          {renderNotifications(getFilteredNotifications("social"))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
