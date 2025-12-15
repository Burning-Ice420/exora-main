"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Toaster } from "sonner"
import ActivitiesHero from "@/components/activities/ActivitiesHero"
import ActivityGrid from "@/components/activities/ActivityGrid"
import { toast } from "sonner"

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState("light")

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

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"))
  const isDark = theme === "dark"

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Toaster position="top-center" richColors />
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="text-sm uppercase tracking-[0.08em] font-semibold">
          District by Zomato — Activities
        </div>
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
            isDark
              ? "border-white/20 bg-white/5 hover:bg-white/10"
              : "border-black/10 bg-black text-white hover:bg-black/90"
          }`}
        >
          {isDark ? "Switch to Light" : "Switch to Dark"}
        </button>
      </header>
      <ActivitiesHero />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className={`inline-block w-8 h-8 border-4 rounded-full animate-spin mb-4 ${
                  isDark
                    ? "border-white/20 border-t-white"
                    : "border-black/20 border-t-black"
                }`}
              ></div>
              <p className={isDark ? "text-white/60 text-sm" : "text-black/50 text-sm"}>
                Loading activities...
              </p>
            </div>
          </div>
        ) : (
          <ActivityGrid activities={activities} />
        )}
      </section>
    </main>
  )
}

