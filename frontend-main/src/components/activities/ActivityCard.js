"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"

export default function ActivityCard({ activity }) {

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

  const imageUrl = activity.images?.[0]?.url || "/logos.png"
  const activitySlug = activity.slug || activity._id

  return (
    <Link href={`/activity/${activitySlug}`}>
      <motion.div
        className="group bg-white border border-black/10 rounded-2xl overflow-hidden hover:border-[#0a7ea4]/30 transition-all duration-300 cursor-pointer"
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
          {imageUrl && imageUrl !== "🎯" ? (
            <Image
              src={imageUrl}
              alt={activity.name}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🎯
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#0a7ea4] border border-[#0a7ea4]/20">
              {formatPrice(activity.price)}
            </span>
          </div>
          {activity.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-[#0a7ea4] text-white px-3 py-1 rounded-full text-xs font-semibold">
                {activity.category}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <h3 className="text-xl font-bold text-black mb-2 leading-tight tracking-tight group-hover:text-[#0a7ea4] transition-colors">
              {activity.name}
            </h3>
            {activity.description && (
              <p className="text-sm text-black/65 line-clamp-2 leading-relaxed">
                {activity.description}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-black/5">
            {(activity.time || activity.date) && (
              <div className="flex items-center gap-2 text-sm text-black/60">
                <Clock className="w-4 h-4 text-[#0a7ea4]" strokeWidth={1.5} />
                <span>
                  {activity.time || formatDate(activity.date)}
                  {activity.time && activity.date && ` • ${formatDate(activity.date)}`}
                </span>
              </div>
            )}
            {activity.location?.name && (
              <div className="flex items-center gap-2 text-sm text-black/60">
                <MapPin className="w-4 h-4 text-[#0a7ea4]" strokeWidth={1.5} />
                <span className="line-clamp-1">{activity.location.name}</span>
              </div>
            )}
          </div>

          <motion.div
            className="w-full mt-5 px-5 py-3.5 bg-[#0a7ea4] text-white rounded-xl font-semibold text-sm text-center hover:bg-[#08759a] transition-colors"
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

