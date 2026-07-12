import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex-1 pb-16 lg:pb-0 overflow-y-auto">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
