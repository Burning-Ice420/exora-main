"use client"

import { motion } from "framer-motion"
import { Clock, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use3DTilt } from "@/hooks/use3DTilt"

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

    // Fallback: allow obvious direct image files for other CDNs
    const path = u.pathname.toLowerCase()
    return /\.(png|jpe?g|webp|gif|avif|svg)$/.test(path)
  } catch {
    return false
  }
}

export default function ActivityCard({ activity, isDark = false }) {
  const { ref: tiltRef } = use3DTilt({ maxRotation: 3.25, scale: 1.015, shadowIntensity: 0.12 })

  const formatDate = (dateString) => {
    if (!dateString) return "TBD"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free"
    return `₹${price.toLocaleString("en-IN")}`
  }

  const rawImageUrl = activity.images?.[0]?.url
  const imageUrl = isValidRemoteImageUrl(rawImageUrl) ? rawImageUrl : "/logos.png"
  const activitySlug = activity.slug || activity._id

  return (
    <Link href={`/activity/${activitySlug}`}>
      <motion.div
        ref={tiltRef}
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
          isDark
            ? "bg-white/5 border-white/10 hover:border-white/20"
            : "bg-white border-black/10 hover:border-black/15"
        }`}
        whileHover={{ y: -6 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
            isDark
              ? "bg-[radial-gradient(100%_60%_at_50%_0%,rgba(14,165,233,0.18)_0%,rgba(0,0,0,0)_60%)]"
              : "bg-[radial-gradient(100%_60%_at_50%_0%,rgba(14,165,233,0.12)_0%,rgba(255,255,255,0)_60%)]"
          }`}
        />
        <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
          {imageUrl && imageUrl !== "🎯" ? (
            <Image
              src={imageUrl}
              alt={activity.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🎯
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/35" />
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#0a7ea4] border border-white/40 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.7)]">
              {formatPrice(activity.price)}
            </span>
          </div>
          {activity.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-[#0a7ea4] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-[0_10px_25px_-18px_rgba(0,0,0,0.7)]">
                {activity.category}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <h3
              className={`text-xl font-semibold mb-2 leading-tight tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-white" : "text-black group-hover:text-[#0a7ea4]"
              }`}
            >
              {activity.name}
            </h3>
            {activity.description && (
              <p className={isDark ? "text-sm text-white/65 line-clamp-2 leading-relaxed" : "text-sm text-black/65 line-clamp-2 leading-relaxed"}>
                {activity.description}
              </p>
            )}
          </div>

          <div className={`space-y-2 pt-2 border-t ${isDark ? "border-white/10" : "border-black/5"}`}>
            {(activity.time || activity.date) && (
              <div className={isDark ? "flex items-center gap-2 text-sm text-white/65" : "flex items-center gap-2 text-sm text-black/60"}>
                <Clock className="w-4 h-4 text-[#0a7ea4]" strokeWidth={1.5} />
                <span>
                  {activity.time || formatDate(activity.date)}
                  {activity.time && activity.date && ` • ${formatDate(activity.date)}`}
                </span>
              </div>
            )}
            {activity.location?.name && (
              <div className={isDark ? "flex items-center gap-2 text-sm text-white/65" : "flex items-center gap-2 text-sm text-black/60"}>
                <MapPin className="w-4 h-4 text-[#0a7ea4]" strokeWidth={1.5} />
                <span className="line-clamp-1">{activity.location.name}</span>
              </div>
            )}
          </div>

          <motion.div
            className="w-full mt-5 px-5 py-3.5 rounded-xl font-semibold text-sm text-center transition-all duration-300 bg-[#0a7ea4] text-white hover:bg-[#08759a] shadow-[0_18px_40px_-28px_rgba(10,126,164,0.85)]"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            View Details
          </motion.div>
        </div>
      </motion.div>
    </Link>
  )
}

