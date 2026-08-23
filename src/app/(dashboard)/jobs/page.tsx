import { prisma } from "@/lib/prisma"
import Link from "next/link"
import JobsPageClient from "./page-client"
import type { Job } from "@/types"

export default async function JobsPage() {
  let jobs: Job[] = []
  try {
    jobs = (await prisma.job.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    })) as unknown as Job[]
  } catch {
    // DB not available, render client-only
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Board</h1>
        <Link
          href="/jobs/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Post a Job
        </Link>
      </div>

      <p className="text-zinc-500 mb-4">
        Find local jobs in Githogoro, Nairobi. Browse full-time, part-time, casual, and internship opportunities near Runda, Northern Bypass, and Westlands.
      </p>

      <JobsPageClient initialJobs={jobs} />
    </div>
  )
}
