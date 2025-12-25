"use client"

import { motion } from "framer-motion"
import ActivityCard from "./ActivityCard"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export default function ActivityGrid({ activities, isDark = false }) {

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-20">
        <p className={isDark ? "text-white/70 text-lg" : "text-black/60 text-lg"}>No activities found</p>
        <p className={isDark ? "text-white/45 text-sm mt-2" : "text-black/35 text-sm mt-2"}>
          Check back later for new experiences
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {activities.map((activity, index) => (
        <ActivityCard
          key={activity._id || activity.id || index}
          activity={activity}
          isDark={isDark}
        />
      ))}
    </motion.div>
  )
}

