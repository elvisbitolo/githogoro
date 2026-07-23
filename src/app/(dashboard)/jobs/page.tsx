import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import JobsPageClient from "./page-client"

const JOB_TYPE_BADGE: Record<string, string> = {
  "full-time": "bg-emerald-100 text-emerald-700",
  "part-time": "bg-blue-100 text-blue-700",
  casual: "bg-amber-100 text-amber-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-pink-100 text-pink-700",
}

export default async function JobsPage() {
  let jobs: any[] = []
  try {
    jobs = await prisma.job.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
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

      {jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            JOB_TYPE_BADGE[job.jobType] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {job.jobType}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 mt-1">{job.employerName}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            Ksh {job.salaryRange}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {formatRelativeTime(job.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 mt-3 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No jobs posted yet</p>
            <p className="text-sm text-zinc-400 mt-1">Be the first to post a job!</p>
          </CardContent>
        </Card>
      )}

      <JobsPageClient />
    </div>
  )
}
