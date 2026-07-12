"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, Phone, Clock } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.from("jobs").select("*").eq("is_active", true).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setJobs(data)
      setLoading(false)
    })
  }, [supabase])

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

      <div className="space-y-3">
        {!jobs || jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No jobs posted yet</p>
              <p className="text-sm text-zinc-400 mt-1">Be the first to post a job!</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{job.employer_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          Ksh {job.salary_range}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatRelativeTime(job.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 mt-3 line-clamp-2">{job.description}</p>
                  </div>
                  <Badge variant={job.job_type === "casual" ? "warning" : "default"}>
                    {job.job_type}
                  </Badge>
                </div>
                {job.contact_phone && (
                  <div className="mt-3 pt-3 border-t border-zinc-100">
                    <a
                      href={`tel:${job.contact_phone}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {job.contact_phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
