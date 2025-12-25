"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Toaster } from "sonner"
import ActivitiesHero from "@/components/activities/ActivitiesHero"
import ActivityGrid from "@/components/activities/ActivityGrid"
import { toast } from "sonner"

function ActivityGridSkeleton({ isDark = false, count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl overflow-hidden border ${
            isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white"
          }`}
        >
          <div className={`aspect-[4/3] ${isDark ? "bg-white/10" : "bg-black/5"} relative`}>
            <div
              className={`absolute inset-0 ${
                isDark
                  ? "bg-[linear-gradient(110deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))]"
                  : "bg-[linear-gradient(110deg,rgba(0,0,0,0.04),rgba(0,0,0,0.08),rgba(0,0,0,0.04))]"
              } animate-pulse`}
            />
          </div>
          <div className="p-5 space-y-3">
            <div className={`h-5 w-3/4 rounded ${isDark ? "bg-white/10" : "bg-black/10"} animate-pulse`} />
            <div className={`h-4 w-full rounded ${isDark ? "bg-white/10" : "bg-black/10"} animate-pulse`} />
            <div className={`h-4 w-5/6 rounded ${isDark ? "bg-white/10" : "bg-black/10"} animate-pulse`} />
            <div className={`h-10 w-full rounded-xl ${isDark ? "bg-white/10" : "bg-black/10"} animate-pulse`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch activities from new API
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.exora.in"
        const response = await fetch(`${API_BASE_URL}/api/activities?limit=50&page=1`)

        if (response.ok) {
          const data = await response.json()
          if (data.activities) {
            setActivities(data.activities)
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
        toast.error("Failed to load activities. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const isDark = true

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        "bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(14,165,233,0.12),rgba(0,0,0,0)_60%),radial-gradient(900px_500px_at_0%_100%,rgba(99,102,241,0.10),rgba(0,0,0,0)_55%),linear-gradient(180deg,#070709,#000000)] text-white"
      }`}
    >
      <Toaster position="top-center" richColors />
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-2xl grid place-items-center border ${
              "border-white/12 bg-white/5"
            } shadow-[0_18px_40px_-30px_rgba(0,0,0,0.6)]`}
          >
            <span className="text-sm font-bold tracking-tight">D</span>
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.08em] font-semibold opacity-90">
              Exclusives by Exora
            </div>
            <div className="text-xs text-white/60">
              Activities • Curated picks
            </div>
          </div>
        </div>
      </header>

      <ActivitiesHero isDark={isDark} activities={activities} />

      <motion.section
        id="activities"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {loading ? (
          <div className="pt-2">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className={isDark ? "text-white/80 text-sm font-semibold" : "text-black/70 text-sm font-semibold"}>
                  Browse
                </div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Activities near you
                </div>
              </div>
              <div className={isDark ? "text-white/50 text-sm" : "text-black/45 text-sm"}>
                Loading curated list…
              </div>
            </div>
            <ActivityGridSkeleton isDark={isDark} />
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className={isDark ? "text-white/80 text-sm font-semibold" : "text-black/70 text-sm font-semibold"}>
                  Browse
                </div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Activities near you
                </div>
              </div>
              <div className={isDark ? "text-white/50 text-sm" : "text-black/45 text-sm"}>
                {activities?.length ? `${activities.length} experiences` : "Curated experiences"}
              </div>
            </div>
            <ActivityGrid activities={activities} isDark={isDark} />
          </div>
        )}
      </motion.section>
    </main>
  )
}

