self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "Githogoro Connect", body: "You have a new notification" }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: data.url || "/dashboard",
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data))
})
