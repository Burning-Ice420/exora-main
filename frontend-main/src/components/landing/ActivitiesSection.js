"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const containerVariants = (reducedMotion) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.1,
      delayChildren: 0.1,
    },
  },
})

const itemVariants = (reducedMotion) => ({
  hidden: { 
    opacity: 0, 
    y: reducedMotion ? 0 : 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
})

function isValidRemoteImageUrl(url) {
  if (!url || typeof url !== "string") return false
  if (url.startsWith("/")) return true
  if (url === "🎯") return false
  if (url.startsWith("data:")) return false

  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    const allowedHost =
      host === "images.unsplash.com" ||
      host === "images.pexels.com" ||
      host === "res.cloudinary.com" ||
      host.endsWith(".cloudinary.com")

    if (allowedHost) return true

    const path = u.pathname.toLowerCase()
    return /\.(png|jpe?g|webp|gif|avif|svg)$/.test(path)
  } catch {
    return false
  }
}

export default function ActivitiesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const reducedMotion = useReducedMotion()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.exora.in"
        const response = await fetch(`${API_BASE_URL}/api/activities?limit=6&page=1&status=active`)

        if (response.ok) {
          const data = await response.json()
          if (data.activities) {
            setActivities(data.activities.slice(0, 6)) // Show max 6 activities
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "TBD"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <section
      ref={ref}
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          variants={itemVariants(reducedMotion)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Join Our Activities
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md max-w-2xl mx-auto">
            Discover curated experiences and connect with fellow travelers. Book your spot and start your adventure.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md animate-pulse"
              >
                <div className="aspect-[4/3] bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-white/10 rounded" />
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-10 w-full bg-white/10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <motion.div
            className="flex flex-wrap justify-center gap-6"
            variants={containerVariants(reducedMotion)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {activities.map((activity, index) => {
              const imageUrl = activity.images?.[0]?.url
              const hasValidImage = isValidRemoteImageUrl(imageUrl)
              const activityLink = `/activity/${activity.slug || activity._id}`

              return (
                <motion.div
                  key={activity._id || index}
                  variants={itemVariants(reducedMotion)}
                  className="group rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 w-full max-w-sm"
                >
                  <Link href={activityLink}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                      {hasValidImage ? (
                        <Image
                          src={imageUrl}
                          alt={activity.name || "Activity"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🎯
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {activity.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full bg-[#0a7ea4] text-white text-xs font-semibold">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 tracking-tight line-clamp-2 group-hover:text-[#0a7ea4] transition-colors">
                        {activity.name}
                      </h3>
                      {activity.description && (
                        <p className="text-sm text-white/70 mb-4 line-clamp-2">
                          {activity.description.replace(/<[^>]*>/g, "").slice(0, 100)}...
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
                        {activity.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(activity.date)}</span>
                          </div>
                        )}
                        {activity.location?.name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{activity.location.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-[#0a7ea4]">
                            ₹{activity.price?.toLocaleString("en-IN") || "0"}
                          </span>
                          {activity.originalPrice && activity.originalPrice > activity.price && (
                            <span className="text-sm text-white/40 line-through ml-2">
                              ₹{activity.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[#0a7ea4] text-sm font-semibold group-hover:gap-2 transition-all">
                          <span>Book Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-12"
            variants={itemVariants(reducedMotion)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <p className="text-white/70 text-lg">No activities available at the moment.</p>
            <p className="text-white/50 text-sm mt-2">Check back later for new experiences.</p>
          </motion.div>
        )}

        {activities.length > 0 && (
          <motion.div
            className="text-center mt-10"
            variants={itemVariants(reducedMotion)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              <span>View All Activities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

