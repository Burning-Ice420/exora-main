"use client"

import { motion } from "framer-motion"

/**
 * Circular Profile Completion Indicator
 * Shows completion percentage as a ring around profile picture
 */
export default function ProfileCompletionIndicator({ 
  completion = 0, 
  size = 64,
  strokeWidth = 4,
  showPercentage = true,
  className = ""
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (completion / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center pointer-events-none ${className}`} style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-primary"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      
      {/* Percentage text (optional) - centered in ring */}
      {showPercentage && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {completion}%
        </motion.div>
      )}
    </div>
  )
}

