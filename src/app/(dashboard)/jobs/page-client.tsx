"use client"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Briefcase, MapPin, Clock, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

interface Job {
  id: string
  title: string
  employerName: string
  location: string
  jobType: string
  salaryRange: string | null
  description: string
  createdAt: string
}

const JOB_TYPES = [
  { value: "all", label: "All" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "casual", label: "Casual" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

const JOB_TYPE_BADGE: Record<string, string> = {
  "full-time": "bg-emerald-100 text-emerald-700",
  "part-time": "bg-blue-100 text-blue-700",
  casual: "bg-amber-100 text-amber-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-pink-100 text-pink-700",
}

export default function JobsPageClient() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [sort, setSort] = useState("newest")
  const [initialized, setInitialized] = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (search) params.set("search", search)
      if (locationFilter) params.set("location", locationFilter)
      params.set("sort", sort)

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setJobs(data)
      }
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [typeFilter, search, locationFilter, sort])

  useEffect(() => {
    setLoading(true)
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    const timeout = setTimeout(fetchJobs, 300)
    return () => clearTimeout(timeout)
  }, [search])

  if (!initialized && !loading) return null

  return (
    <>
      <div className="relative mb-4 mt-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search jobs by title, employer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {JOB_TYPES.map((jt) => (
          <button
            key={jt.value}
            onClick={() => setTypeFilter(jt.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              typeFilter === jt.value
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {jt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white pl-8 pr-4 py-1 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-zinc-100 rounded-2xl" />
            </div>
          ))
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No jobs found</p>
              <p className="text-sm text-zinc-400 mt-1">
                {search || typeFilter !== "all" || locationFilter
                  ? "Try adjusting your filters"
                  : "Be the first to post a job!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
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
          ))
        )}
      </div>
    </>
  )
}
